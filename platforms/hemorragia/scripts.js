(function () {
  const data = window.HEMORRAGIA_DATA;
  const pageHost = document.getElementById("pageHost");

  if (!data) {
    if (pageHost) {
      pageHost.innerHTML = `
        <section class="hero">
          <div class="hero__copy">
            <span class="section-kicker">Erro de carregamento</span>
            <h1>Os dados do modulo nao foram encontrados</h1>
            <p>Verifique se o arquivo <code>content-data.js</code> foi carregado antes do motor principal da plataforma.</p>
          </div>
        </section>
      `;
    }
    return;
  }

  const {
    APP_CONFIG = {},
    PAGE_META = {},
    CLINICAL_PAGES = {},
    TOOL_CHECKLISTS = {},
    COMPARISON_SETS = [],
    FLOW_CARDS = [],
    MNEMONIC_GROUPS = [],
    PITFALLS = [],
    REVIEW_TABLES = [],
    QUIZ_QUESTIONS = [],
    FLASHCARDS = [],
    UPDATE_ITEMS = []
  } = data;

  const STORAGE_KEY = "hemorragia-digestiva-premium-v1";
  const pageId = document.body.dataset.page || "dashboard";
  const rootPrefix = pageId === "dashboard" ? "." : "..";
  const pageMeta = PAGE_META[pageId] || PAGE_META.dashboard || {
    id: "dashboard",
    title: "Dashboard",
    subtitle: ""
  };
  const clinicalIds = Object.keys(CLINICAL_PAGES);
  const clinicalCount = clinicalIds.length;
  const FLASHCARD_COUNT = FLASHCARDS.length;
  const QUIZ_COUNT = QUIZ_QUESTIONS.length;

  if (PAGE_META.flashcards) {
    PAGE_META.flashcards.badge = String(FLASHCARD_COUNT);
    PAGE_META.flashcards.subtitle = `${FLASHCARD_COUNT} cards de evocacao ativa por tema`;
  }
  if (PAGE_META.quiz) {
    PAGE_META.quiz.badge = `${QUIZ_COUNT} Q`;
    PAGE_META.quiz.subtitle = `${QUIZ_COUNT} questoes estilo residencia com feedback`;
  }

  const GROUPS = [
    {
      id: "principal",
      title: "Principal",
      dashboardTitle: "Principal",
      dashboardSubtitle: "A trilha de entrada do modulo e o mapa geral de estudo."
    },
    {
      id: "alta",
      title: "Hemorragia Alta",
      dashboardTitle: "Hemorragia Digestiva Alta",
      dashboardSubtitle: "Topografia, endoscopia, DUP, Forrest e causas especiais."
    },
    {
      id: "baixa",
      title: "Hemorragia Baixa",
      dashboardTitle: "Hemorragia Digestiva Baixa",
      dashboardSubtitle: "Colonoscopia, angio, doenca diverticular, angiodisplasia e Meckel."
    },
    {
      id: "ferramentas",
      title: "Ferramentas",
      dashboardTitle: "Ferramentas de Retencao",
      dashboardSubtitle: "Comparacoes, fluxos, macetes, casos guiados, banco de questoes e revisao final."
    }
  ];

  function resolvePath(path) {
    return /^https?:/i.test(path) ? path : `${rootPrefix}/${path}`;
  }

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function escapeAttr(value) {
    return String(value ?? "").replace(/"/g, "&quot;");
  }

  function loadState() {
    const stored = safeParse(localStorage.getItem(STORAGE_KEY), {});
    stored.reviewedPages = stored.reviewedPages || {};
    stored.checklists = stored.checklists || {};
    stored.quiz = stored.quiz || { best: 0, last: 0, runs: 0 };
    stored.flashcards = stored.flashcards || { cards: {} };
    stored.pageQuizzes = stored.pageQuizzes || {};
    stored.sidebar = stored.sidebar || { collapsed: false };
    return stored;
  }

  const state = loadState();
  document.body.dataset.theme = pageMeta.theme || "red";
  document.body.classList.toggle("sidebar-collapsed", Boolean(state.sidebar.collapsed));
  document.title = `${pageMeta.title} · ${APP_CONFIG.appName || "Hemorragia Digestiva Premium"}`;

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getChecklistItems(id) {
    if (CLINICAL_PAGES[id] && Array.isArray(CLINICAL_PAGES[id].checklist)) {
      return CLINICAL_PAGES[id].checklist;
    }
    return TOOL_CHECKLISTS[id] || [];
  }

  function getChecklistProgress(id) {
    const items = getChecklistItems(id);
    const bucket = state.checklists[id] || {};
    const done = items.filter((item) => Boolean(bucket[item.id])).length;
    return { done, total: items.length };
  }

  function hasMiniQuiz(id) {
    return Boolean(CLINICAL_PAGES[id] && Array.isArray(CLINICAL_PAGES[id].pageQuiz) && CLINICAL_PAGES[id].pageQuiz.length);
  }

  function getMiniQuizProgress(id) {
    const items = hasMiniQuiz(id) ? CLINICAL_PAGES[id].pageQuiz : [];
    const answers = (state.pageQuizzes[id] && state.pageQuizzes[id].answers) || {};
    const answered = Object.keys(answers).length;
    const correct = items.reduce((sum, item, index) => {
      return sum + (Number(answers[index]) === item.correct ? 1 : 0);
    }, 0);
    const total = items.length;
    const percent = total ? Math.round((correct / total) * 100) : 0;
    return {
      answered,
      correct,
      total,
      percent,
      completed: total > 0 && answered === total,
      passed: total > 0 && answered === total && percent >= 80
    };
  }

  function getPageProgress(id) {
    const checklist = getChecklistProgress(id);
    const reviewTotal = id === "dashboard" ? 0 : 1;
    const reviewDone = id !== "dashboard" && state.reviewedPages[id] ? 1 : 0;
    const miniQuiz = getMiniQuizProgress(id);
    const quizTotal = miniQuiz.total ? 2 : 0;
    const quizDone = (miniQuiz.completed ? 1 : 0) + (miniQuiz.passed ? 1 : 0);
    const done = checklist.done + reviewDone + quizDone;
    const total = checklist.total + reviewTotal + quizTotal;
    return {
      done,
      total,
      percent: total ? Math.round((done / total) * 100) : 0
    };
  }

  function getOverallProgress() {
    const trackable = Object.keys(PAGE_META).filter((id) => id !== "dashboard");
    const sum = trackable.reduce((acc, id) => {
      const progress = getPageProgress(id);
      acc.done += progress.done;
      acc.total += progress.total;
      return acc;
    }, { done: 0, total: 0 });
    return {
      done: sum.done,
      total: sum.total,
      percent: sum.total ? Math.round((sum.done / sum.total) * 100) : 0
    };
  }

  function getFlashcardStats() {
    const cards = state.flashcards.cards || {};
    const seen = FLASHCARDS.filter((card) => cards[card.front] && cards[card.front].seen).length;
    const difficult = FLASHCARDS.filter((card) => cards[card.front] && cards[card.front].difficult).length;
    const categoriesSeen = {};
    FLASHCARDS.forEach((card) => {
      if (cards[card.front] && cards[card.front].seen) {
        categoriesSeen[card.category] = true;
      }
    });
    return {
      seen,
      difficult,
      categoriesSeen: Object.keys(categoriesSeen).length,
      total: FLASHCARD_COUNT
    };
  }

  function refreshToolFlags() {
    const stats = getFlashcardStats();
    state.checklists.flashcards = state.checklists.flashcards || {};
    if (stats.seen === FLASHCARD_COUNT) {
      state.checklists.flashcards.todos = true;
    }
    if (stats.categoriesSeen >= 5) {
      state.checklists.flashcards.categorias = true;
    }
    if (stats.difficult > 0) {
      state.checklists.flashcards.dificeis = true;
    }
    saveState();
  }

  function getGroupedMeta() {
    const items = Object.values(PAGE_META);
    return GROUPS.map((group) => ({
      ...group,
      items: items.filter((item) => item.category === group.id)
    }));
  }

  function renderSidebar() {
    const host = document.getElementById("appSidebar");
    if (!host) return;

    const grouped = getGroupedMeta();
    const overall = getOverallProgress();
    const flashStats = getFlashcardStats();

    function renderLink(item) {
      const progress = getPageProgress(item.id);
      const badge = item.badge || (progress.total ? `${progress.percent}%` : (item.id === "dashboard" ? "home" : item.kindLabel));
      return `
        <a
          class="nav-link ${item.id === pageId ? "is-active" : ""}"
          href="${resolvePath(item.href)}"
          data-tooltip="${escapeAttr(item.shortTitle || item.title)}"
          title="${escapeAttr(item.title)}"
        >
          <span class="nav-link__icon">${item.icon}</span>
          <span class="nav-link__copy">
            <strong>${item.shortTitle || item.title}</strong>
            <small>${item.subtitle}</small>
          </span>
          <span class="nav-link__meta">${badge}</span>
        </a>
      `;
    }

    function renderSection(group) {
      if (!group.items.length) return "";
      return `
        <div class="nav-section">
          <div class="nav-section-title">${group.title}</div>
          ${group.items.map(renderLink).join("")}
        </div>
      `;
    }

    host.innerHTML = `
      <div class="sidebar-panel">
        <div class="sidebar-panel__top">
          <a class="brand" href="${resolvePath(PAGE_META.dashboard.href)}" title="${escapeAttr(APP_CONFIG.brandTitle || "Hemorragia Digestiva Premium")}">
            <span class="brand__orb">${APP_CONFIG.brandOrb || "HGI"}</span>
            <div class="brand__copy">
              <h1>${APP_CONFIG.brandTitle || "Hemorragia Digestiva Premium"}</h1>
              <p>${APP_CONFIG.brandSubtitle || "HDA, HDB, exames e etiologias mais cobradas"}</p>
            </div>
          </a>
          <div class="sidebar-toolbar">
            <span class="sidebar-kicker">${APP_CONFIG.brandKicker || "premium • cirurgia • prova • retencao"}</span>
            <div class="sidebar-toolbar__actions">
              <button class="icon-btn desktop-only" id="sidebarToggle" type="button" aria-label="${state.sidebar.collapsed ? "Expandir menu" : "Recolher menu"}">
                ${state.sidebar.collapsed ? "→" : "←"}
              </button>
              <button class="icon-btn mobile-only" id="sidebarClose" type="button" aria-label="Fechar menu">✕</button>
            </div>
          </div>
        </div>
        <nav class="sidebar-nav">
          ${grouped.map(renderSection).join("")}
        </nav>
        <div class="sidebar-progress">
          <h3>Progresso do modulo</h3>
          <div class="progress-track"><div class="progress-fill" style="width:${overall.percent}%"></div></div>
          <div class="sidebar-progress__meta"><span>Etapas concluidas</span><strong>${overall.done}/${overall.total}</strong></div>
          <div class="sidebar-progress__meta"><span>Melhor rodada</span><strong>${state.quiz.best}%</strong></div>
          <div class="sidebar-progress__meta"><span>Flashcards vistos</span><strong>${flashStats.seen}/${flashStats.total}</strong></div>
        </div>
        <div class="sidebar-footer">
          <strong>Regra de ouro</strong>
          <p>Escaneavel sem empobrecer a aula. O conteudo continua denso, mas agora navega como plataforma real.</p>
        </div>
      </div>
    `;
  }

  function renderTopbar() {
    const host = document.getElementById("appTopbar");
    if (!host) return;

    const progress = getPageProgress(pageId);
    const overall = getOverallProgress();

    host.innerHTML = `
      <div class="topbar-copy">
        <div class="topbar-copy__lead">
          <button class="icon-btn mobile-only" id="mobileMenu" type="button" aria-label="Abrir menu">☰</button>
          <button class="icon-btn desktop-only" id="topbarSidebarToggle" type="button" aria-label="${state.sidebar.collapsed ? "Expandir menu" : "Recolher menu"}">
            ${state.sidebar.collapsed ? "→" : "←"}
          </button>
          <span class="topbar-kicker">${pageMeta.kindLabel || "modulo"}</span>
        </div>
        <h2>${pageMeta.title}</h2>
        <p>${pageMeta.subtitle || ""}</p>
      </div>
      <div class="topbar-actions">
        <span class="pill">${progress.percent}% desta pagina</span>
        <span class="pill">${overall.percent}% da plataforma</span>
      </div>
    `;
  }

  function wireShell() {
    const open = document.getElementById("mobileMenu");
    const close = document.getElementById("sidebarClose");
    const scrim = document.getElementById("mobileScrim");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const topbarToggle = document.getElementById("topbarSidebarToggle");

    if (open) {
      open.addEventListener("click", () => document.body.classList.add("menu-open"));
    }
    if (close) {
      close.addEventListener("click", () => document.body.classList.remove("menu-open"));
    }
    if (scrim) {
      scrim.addEventListener("click", () => document.body.classList.remove("menu-open"));
    }

    function toggleSidebar() {
      state.sidebar.collapsed = !state.sidebar.collapsed;
      saveState();
      document.body.classList.toggle("sidebar-collapsed", Boolean(state.sidebar.collapsed));
      rerender();
    }

    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", toggleSidebar);
    }
    if (topbarToggle) {
      topbarToggle.addEventListener("click", toggleSidebar);
    }
  }

  function renderParagraphs(paragraphs) {
    return paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
  }

  function renderBullets(items) {
    return `<ul class="bullet-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  }

  function renderOrdered(items) {
    return `<ol class="ordered-list">${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
  }

  function renderSectionCard(icon, title, subtitle, body, extraClass = "") {
    return `
      <article class="section-card ${extraClass} animate-ready">
        <div class="section-card__header">
          <span class="section-card__icon">${icon}</span>
          <div class="section-card__title">
            <h3>${title}</h3>
            ${subtitle ? `<p>${subtitle}</p>` : ""}
          </div>
        </div>
        <div class="section-card__body">${body}</div>
      </article>
    `;
  }

  function renderTableCard(section) {
    return renderSectionCard(
      section.icon || "⇄",
      section.title,
      section.subtitle,
      `
        <div class="table-wrap">
          <table class="comparison-table">
            <thead><tr>${section.headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
            <tbody>${section.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>
        </div>
      `
    );
  }

  function renderTreatmentCard(section) {
    const firstLine = section.firstLine.map((item) => `
      <div class="med-row">
        <strong>${item.name}</strong>
        <div class="med-row__meta">
          <span class="med-chip">${item.dose}</span>
          <span class="med-chip">${item.route}</span>
          <span class="med-chip">${item.duration}</span>
        </div>
      </div>
    `).join("");

    const notes = section.notes && section.notes.length
      ? `<div class="note-box"><h4>Observacoes que valem ponto</h4>${renderBullets(section.notes)}</div>`
      : "";

    const alternatives = section.alternatives && section.alternatives.length
      ? `<div class="warning-box"><h4>Ajustes e alertas</h4>${renderBullets(section.alternatives)}</div>`
      : "";

    return renderSectionCard(
      section.icon || "✓",
      section.title,
      section.subtitle,
      `<div class="treatment-grid"><div class="treatment-card"><h4>Conduta-base</h4><div class="med-list">${firstLine}</div></div>${notes}${alternatives}</div>`
    );
  }

  function renderCardsCard(section) {
    return renderSectionCard(
      section.icon || "◈",
      section.title,
      section.subtitle,
      `
        <div class="special-grid">
          ${section.items.map((item) => `
            <div class="special-card">
              <h4>${item.title}</h4>
              ${renderParagraphs(item.paragraphs)}
            </div>
          `).join("")}
        </div>
      `
    );
  }

  function renderGenericSection(section) {
    switch (section.type) {
      case "paragraphs":
        return renderSectionCard(section.icon || "🧭", section.title, section.subtitle, renderParagraphs(section.paragraphs));
      case "bullets":
        return renderSectionCard(section.icon || "•", section.title, section.subtitle, renderBullets(section.items));
      case "ordered":
        return renderSectionCard(section.icon || "1", section.title, section.subtitle, renderOrdered(section.items));
      case "table":
        return renderTableCard(section);
      case "treatment":
        return renderTreatmentCard(section);
      case "cards":
        return renderCardsCard(section);
      default:
        return "";
    }
  }

  function renderMiniQuizSection(id, quizItems) {
    const storedAnswers = (state.pageQuizzes[id] && state.pageQuizzes[id].answers) || {};
    const progress = getMiniQuizProgress(id);
    const statusTag = progress.completed
      ? `<span class="tag ${progress.passed ? "tag--success" : "tag--warning"}">${progress.percent}% no bloco</span>`
      : `<span class="tag tag--accent">${progress.answered}/${progress.total} respondidas</span>`;

    return renderSectionCard(
      "❓",
      "Quiz de fechamento da pagina",
      "Feche o bloco antes de sair. O objetivo aqui e automatizar decisao, nao so reconhecer a frase certa.",
      `
        <div class="mini-quiz-shell" id="miniQuizSection">
          <div class="quiz-toolbar">
            <div class="quiz-progress">
              <div class="metric-label">Mini quiz da pagina</div>
              <div class="progress-track"><div class="progress-fill" style="width:${progress.total ? progress.percent : 0}%"></div></div>
              <div class="stats-row">
                <span>${progress.correct}/${progress.total} certas</span>
                <span>${statusTag}</span>
              </div>
            </div>
            <div class="button-row">
              ${progress.answered ? `<button class="btn btn--ghost" data-mini-reset type="button">Refazer bloco</button>` : ""}
              <a class="btn btn--soft" href="${resolvePath(PAGE_META.quiz.href)}">Banco completo</a>
            </div>
          </div>
          <div class="mini-quiz-list">
            ${quizItems.map((item, questionIndex) => {
              const selected = storedAnswers[questionIndex];
              const answered = selected !== undefined;
              const correct = Number(selected) === item.correct;
              return `
                <div class="mini-quiz-item">
                  <div class="mini-quiz-item__head">
                    <span class="question-index">${questionIndex + 1}</span>
                    <div class="mini-quiz-meta">
                      <h4>${item.question}</h4>
                      <p>${answered ? (correct ? "Resposta correta marcada." : "Revise o comentario antes de seguir.") : "Escolha a alternativa e leia a justificativa."}</p>
                    </div>
                  </div>
                  <div class="answer-list">
                    ${item.options.map((option, answerIndex) => {
                      const classes = [];
                      if (answered && answerIndex === item.correct) classes.push("is-correct");
                      if (answered && answerIndex === Number(selected) && Number(selected) !== item.correct) classes.push("is-wrong");
                      return `
                        <button
                          class="answer-btn answer-btn--mini ${classes.join(" ")}"
                          type="button"
                          data-mini-answer
                          data-question-index="${questionIndex}"
                          data-answer-index="${answerIndex}"
                          ${answered ? "disabled" : ""}
                        >
                          ${String.fromCharCode(65 + answerIndex)}. ${option}
                        </button>
                      `;
                    }).join("")}
                  </div>
                  ${answered ? `
                    <div class="feedback-box ${correct ? "feedback-box--good" : "feedback-box--bad"}">
                      <strong>${correct ? "Correto." : "Incorreto."}</strong> ${item.explanation}
                    </div>
                  ` : ""}
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `,
      "section-card--mini-quiz"
    );
  }

  function renderChecklistRail(dataBlock) {
    const checklist = getChecklistItems(pageId);
    const bucket = state.checklists[pageId] || {};
    const progress = getPageProgress(pageId);
    const reviewed = Boolean(state.reviewedPages[pageId]);
    const miniQuiz = getMiniQuizProgress(pageId);

    return `
      <div class="checklist-card stat-card animate-ready">
        <div class="metric-label">Progresso da pagina</div>
        <strong>${progress.percent}%</strong>
        <p>${progress.done}/${progress.total} passos concluidos entre checklist, fechamento e quiz da pagina.</p>
        <div class="progress-track"><div class="progress-fill" style="width:${progress.percent}%"></div></div>
      </div>
      ${miniQuiz.total ? `
        <div class="checklist-card animate-ready">
          <h3>Mini quiz</h3>
          <div class="sidebar-progress__meta"><span>Respondidas</span><strong>${miniQuiz.answered}/${miniQuiz.total}</strong></div>
          <div class="sidebar-progress__meta"><span>Acerto</span><strong>${miniQuiz.percent}%</strong></div>
          <div class="sidebar-progress__meta"><span>Status</span><strong>${miniQuiz.passed ? "Fechado" : "Em aberto"}</strong></div>
        </div>
      ` : ""}
      <div class="checklist-card animate-ready">
        <h3>Fechamento da pagina</h3>
        <p>Marque so o que realmente ficou automatico. Familiaridade nao e retencao.</p>
        <div class="button-row">
          <button class="btn ${reviewed ? "btn--soft" : "btn--primary"}" data-review-toggle type="button">
            ${reviewed ? "✓ Pagina revisada" : "Marcar como revisada"}
          </button>
        </div>
        <div class="checklist">
          ${checklist.map((item) => {
            const done = Boolean(bucket[item.id]);
            return `
              <button class="check-item ${done ? "is-done" : ""}" data-check-id="${item.id}" type="button">
                <span class="check-box">${done ? "✓" : ""}</span>
                <span>
                  <strong>${item.label}</strong>
                  <small>${item.note}</small>
                </span>
              </button>
            `;
          }).join("")}
        </div>
      </div>
      <div class="checklist-card animate-ready">
        <h3>Classicos de banca</h3>
        <div class="mini-grid">
          ${(dataBlock.highlights || []).map((item) => `
            <div class="mini-card">
              <div class="mini-card__icon">★</div>
              <p>${item}</p>
            </div>
          `).join("")}
        </div>
      </div>
      ${dataBlock.related && dataBlock.related.length ? `
        <div class="checklist-card animate-ready">
          <h3>Continue daqui</h3>
          <div class="card-grid">
            ${dataBlock.related.map((id) => {
              const meta = PAGE_META[id];
              if (!meta) return "";
              return `
                <a class="page-card" href="${resolvePath(meta.href)}">
                  <div class="page-card__header">
                    <span class="page-card__icon">${meta.icon}</span>
                    <div>
                      <h3>${meta.shortTitle || meta.title}</h3>
                      <p>${meta.subtitle}</p>
                    </div>
                  </div>
                </a>
              `;
            }).join("")}
          </div>
        </div>
      ` : ""}
    `;
  }

  function wireChecklistActions() {
    document.querySelectorAll("[data-review-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        state.reviewedPages[pageId] = !state.reviewedPages[pageId];
        saveState();
        rerender();
      });
    });

    document.querySelectorAll("[data-check-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const checkId = button.getAttribute("data-check-id");
        state.checklists[pageId] = state.checklists[pageId] || {};
        state.checklists[pageId][checkId] = !state.checklists[pageId][checkId];
        saveState();
        rerender();
      });
    });

    document.querySelectorAll("[data-mini-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        const questionIndex = Number(button.getAttribute("data-question-index"));
        const answerIndex = Number(button.getAttribute("data-answer-index"));
        state.pageQuizzes[pageId] = state.pageQuizzes[pageId] || { answers: {} };
        state.pageQuizzes[pageId].answers = state.pageQuizzes[pageId].answers || {};
        if (state.pageQuizzes[pageId].answers[questionIndex] !== undefined) return;
        state.pageQuizzes[pageId].answers[questionIndex] = answerIndex;
        saveState();
        rerender("miniQuizSection");
      });
    });

    document.querySelectorAll("[data-mini-reset]").forEach((button) => {
      button.addEventListener("click", () => {
        state.pageQuizzes[pageId] = { answers: {} };
        saveState();
        rerender("miniQuizSection");
      });
    });
  }

  function renderPageCard(meta) {
    const progress = getPageProgress(meta.id);
    const rightBadge = meta.badge || (progress.total ? `${progress.done}/${progress.total}` : meta.kindLabel);
    return `
      <a class="page-card animate-ready" href="${resolvePath(meta.href)}">
        <div class="page-card__header">
          <span class="page-card__icon">${meta.icon}</span>
          <div>
            <h3>${meta.title}</h3>
            <p>${meta.subtitle}</p>
          </div>
        </div>
        <div class="page-card__footer">
          <span class="count-pill">${progress.total ? `${progress.percent}%` : meta.kindLabel}</span>
          <span class="count-pill">${rightBadge}</span>
        </div>
      </a>
    `;
  }

  function renderClinicalPage(id) {
    const dataBlock = CLINICAL_PAGES[id];
    if (!pageHost || !dataBlock) return;

    pageHost.innerHTML = `
      <section class="hero">
        <div class="hero__copy">
          <span class="section-kicker">${dataBlock.syndrome}</span>
          <h1>${pageMeta.title}</h1>
          <p>${pageMeta.subtitle}. O conteudo foi redistribuido em camadas de leitura rapida, mantendo o raciocinio clinico, as pistas de prova e os pontos que mudam conduta.</p>
          <div class="tag-row">
            ${dataBlock.tags.map((tag) => `<span class="tag tag--${tag.tone}">${tag.label}</span>`).join("")}
          </div>
          <div class="button-row">
            <a class="btn btn--primary" href="${resolvePath(PAGE_META.quiz.href)}">Treinar no banco</a>
            <a class="btn btn--ghost" href="${resolvePath(PAGE_META.comparacoes.href)}">Ver diferenciais</a>
          </div>
        </div>
        <div class="hero__aside">
          <div class="hero-stats">
            ${dataBlock.heroStats.map((stat) => `
              <div class="stat-card animate-ready">
                <div class="metric-label">${stat.label}</div>
                <strong>${stat.value}</strong>
                <p>${stat.detail}</p>
              </div>
            `).join("")}
          </div>
        </div>
      </section>
      <div class="page-grid">
        <div class="main-column">
          ${dataBlock.sections.map(renderGenericSection).join("")}
          ${dataBlock.pageQuiz && dataBlock.pageQuiz.length ? renderMiniQuizSection(id, dataBlock.pageQuiz) : ""}
        </div>
        <aside class="rail-column">${renderChecklistRail(dataBlock)}</aside>
      </div>
    `;

    wireChecklistActions();
  }

  function renderDashboard() {
    if (!pageHost) return;

    const overall = getOverallProgress();
    const flashStats = getFlashcardStats();
    const grouped = getGroupedMeta();

    function groupById(id) {
      return grouped.find((group) => group.id === id) || { items: [] };
    }

    pageHost.innerHTML = `
      <section class="hero">
        <div class="hero__copy">
          <span class="section-kicker">${APP_CONFIG.dashboardHeroKicker || "Plataforma premium de hemorragia digestiva"}</span>
          <h1>${APP_CONFIG.dashboardHeroTitle || "Hemorragia digestiva organizada como plataforma real de revisao"}</h1>
          <p>${APP_CONFIG.dashboardHeroSubtitle || "Uma plataforma focada em estabilizacao, HDA, HDB, exames, etiologias e revisao ativa."}</p>
          <div class="tag-row">
            <span class="tag tag--accent">${clinicalCount} paginas de conteudo</span>
            <span class="tag tag--success">${QUIZ_COUNT} questoes</span>
            <span class="tag tag--purple">${FLASHCARD_COUNT} flashcards</span>
          </div>
          <div class="button-row">
            <a class="btn btn--primary" href="${resolvePath(APP_CONFIG.dashboardPrimaryCtaHref || "paginas/abordagem-uti.html")}">${APP_CONFIG.dashboardPrimaryCtaLabel || "Comecar pela abordagem"}</a>
            <a class="btn btn--ghost" href="${resolvePath(APP_CONFIG.dashboardSecondaryCtaHref || "ferramentas/revisao-rapida.html")}">${APP_CONFIG.dashboardSecondaryCtaLabel || "Ir para revisao rapida"}</a>
          </div>
        </div>
        <div class="hero__aside">
          <div class="hero-stats">
            <div class="stat-card animate-ready">
              <div class="metric-label">Cobertura da plataforma</div>
              <strong>${overall.percent}%</strong>
              <p>${overall.done}/${overall.total} etapas concluidas no conjunto inteiro.</p>
            </div>
            <div class="stat-card animate-ready">
              <div class="metric-label">Melhor rodada</div>
              <strong>${state.quiz.best}%</strong>
              <p>Seu melhor desempenho no banco completo fica salvo localmente.</p>
            </div>
            <div class="stat-card animate-ready">
              <div class="metric-label">Deck ativo</div>
              <strong>${flashStats.seen}/${flashStats.total}</strong>
              <p>Flashcards vistos com marcacao de dificuldade e persistencia local.</p>
            </div>
          </div>
        </div>
      </section>

      ${grouped.map((group) => {
        const groupItems = group.id === "principal"
          ? group.items.filter((item) => item.id !== "dashboard")
          : group.items;
        if (!groupItems.length) return "";
        return `
          <section class="dashboard-group">
            <div class="dashboard-group__title">
              <div class="section-headline">
                <h2>${group.dashboardTitle}</h2>
                <p>${group.dashboardSubtitle}</p>
              </div>
            </div>
            <div class="card-grid">${groupItems.map(renderPageCard).join("")}</div>
          </section>
        `;
      }).join("")}

      <div class="page-grid">
        <div class="main-column">
          ${renderSectionCard(
            "◈",
            APP_CONFIG.dashboardPriorityTitle || "O que este modulo prioriza",
            APP_CONFIG.dashboardPrioritySubtitle || "A aula foi transformada em navegacao, nao em resumo curto.",
            `
              <div class="card-grid">
                ${(APP_CONFIG.dashboardPriorityCards || []).map((item) => `
                  <div class="timeline-card">
                    <div class="metric-label">${item.label}</div>
                    <p>${item.text}</p>
                  </div>
                `).join("")}
              </div>
            `
          )}
          ${renderSectionCard(
            "🗺",
            APP_CONFIG.dashboardTrailTitle || "Trilha sugerida",
            APP_CONFIG.dashboardTrailSubtitle || "Uma ordem boa para estudo progressivo e revisao de prova.",
            renderOrdered(APP_CONFIG.dashboardTrailSteps || [])
          )}
        </div>
        <aside class="rail-column">
          <div class="checklist-card animate-ready">
            <h3>${APP_CONFIG.dashboardSessionTitle || "Meta de sessao"}</h3>
            <div class="mini-grid">
              ${(APP_CONFIG.dashboardSessionItems || []).map((item, index) => `
                <div class="mini-card">
                  <div class="mini-card__icon">${index + 1}</div>
                  <p>${item}</p>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="checklist-card animate-ready">
            <h3>${APP_CONFIG.dashboardIntegrityTitle || "Base preservada"}</h3>
            <p>${APP_CONFIG.dashboardIntegrityText || "A plataforma irma foi mantida intacta em pasta propria."}</p>
          </div>
          <div class="checklist-card animate-ready">
            <h3>Mapa rapido</h3>
            <div class="sidebar-progress__meta"><span>Principal</span><strong>${Math.max(groupById("principal").items.length - 1, 0)}</strong></div>
            <div class="sidebar-progress__meta"><span>HDA</span><strong>${groupById("alta").items.length}</strong></div>
            <div class="sidebar-progress__meta"><span>HDB</span><strong>${groupById("baixa").items.length}</strong></div>
            <div class="sidebar-progress__meta"><span>Ferramentas</span><strong>${groupById("ferramentas").items.length}</strong></div>
          </div>
        </aside>
      </div>
    `;
  }

  function renderComparisonsPage() {
    if (!pageHost) return;

    pageHost.innerHTML = `
      <section class="hero">
        <div class="hero__copy">
          <span class="section-kicker">Diferenciais lado a lado</span>
          <h1>Comparacoes feitas para impedir confusao de prova</h1>
          <p>Estas tabelas concentram o que muda alternativa correta em hemorragia digestiva: topografia, sinal clinico, exame certo, etiologia dominante e cirurgia certa.</p>
          <div class="tag-row">
            <span class="tag tag--purple">${COMPARISON_SETS.length} tabelas principais</span>
            <span class="tag tag--warning">Ponto que desempata a questao</span>
          </div>
        </div>
        <div class="hero__aside">
          <div class="hero-stats">
            <div class="stat-card animate-ready">
              <div class="metric-label">Uso ideal</div>
              <strong>Pre-questao</strong>
              <p>Leia antes do banco quando quiser evitar erro por semelhanca superficial.</p>
            </div>
          </div>
        </div>
      </section>
      <div class="page-grid">
        <div class="main-column table-card-list">
          ${COMPARISON_SETS.map((set) => renderSectionCard(
            "⇄",
            set.title,
            set.description,
            `
              <div class="table-wrap">
                <table class="comparison-table">
                  <thead><tr>${set.headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
                  <tbody>${set.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
                </table>
              </div>
            `
          )).join("")}
        </div>
        <aside class="rail-column">${renderChecklistRail({
          highlights: [
            "Hematemese define alta; hematoquezia so sugere baixa.",
            "Colonoscopia e o melhor exame da HDB, mas nao e soberana como a EDA na HDA.",
            "Meckel sangrante exige lembrar do delgado adjacente."
          ],
          related: ["fluxogramas", "quiz", "revisao-rapida"]
        })}</aside>
      </div>
    `;

    wireChecklistActions();
  }

  function renderFlowPage() {
    if (!pageHost) return;

    pageHost.innerHTML = `
      <section class="hero">
        <div class="hero__copy">
          <span class="section-kicker">Fluxos mentais</span>
          <h1>Algoritmos curtos para pensar sob pressao</h1>
          <p>Os fluxos abaixo foram escritos para caber na cabeca durante prova e plantao. Cada um preserva a logica fisiologica e destaca o ponto em que a conduta muda.</p>
          <div class="tag-row">
            <span class="tag tag--accent">${FLOW_CARDS.length} fluxogramas</span>
            <span class="tag tag--success">Reproduziveis mentalmente</span>
          </div>
        </div>
        <div class="hero__aside">
          <div class="hero-stats">
            <div class="stat-card animate-ready">
              <div class="metric-label">Melhor uso</div>
              <strong>Pos-leitura</strong>
              <p>Leia depois da pagina clinica para converter teoria em sequencia de decisao.</p>
            </div>
          </div>
        </div>
      </section>
      <div class="page-grid">
        <div class="main-column">
          ${renderSectionCard(
            "↺",
            "Fluxogramas do modulo",
            "Cada card abaixo foi escrito para ser lido em 30 a 60 segundos.",
            `
              <div class="card-grid">
                ${FLOW_CARDS.map((flow) => `
                  <div class="flow-card animate-ready">
                    <h3>${flow.title}</h3>
                    <ol>${flow.steps.map((step) => `<li>${step}</li>`).join("")}</ol>
                    <p>${flow.note}</p>
                  </div>
                `).join("")}
              </div>
            `
          )}
        </div>
        <aside class="rail-column">${renderChecklistRail({
          highlights: [
            "ABC vem antes da topografia.",
            "EDA manda na HDA; colonoscopia manda na HDB estavel.",
            "Se a endoscopia nao controla, a imagem vascular sobe de degrau."
          ],
          related: ["comparacoes", "mnemonicos", "quiz"]
        })}</aside>
      </div>
    `;

    wireChecklistActions();
  }

  function renderMnemonicsPage() {
    if (!pageHost) return;

    pageHost.innerHTML = `
      <section class="hero">
        <div class="hero__copy">
          <span class="section-kicker">Macetes uteis</span>
          <h1>Mnemônicos que ajudam sem trair a fisiologia</h1>
          <p>O objetivo aqui nao e decorar frase solta. E encurtar o caminho ate a pista certa quando a banca mistura topografia, exame e etiologia no mesmo caso.</p>
          <div class="tag-row">
            <span class="tag tag--purple">Blocos por tema</span>
            <span class="tag tag--accent">Perda volemica, Forrest, Treitz e Meckel</span>
          </div>
        </div>
        <div class="hero__aside">
          <div class="hero-stats">
            <div class="stat-card animate-ready">
              <div class="metric-label">Uso ideal</div>
              <strong>Antes do quiz</strong>
              <p>Serve como aquecimento para evocacao rapida sem perder o nexo clinico.</p>
            </div>
          </div>
        </div>
      </section>
      <div class="page-grid">
        <div class="main-column">
          ${MNEMONIC_GROUPS.map((group) => renderSectionCard(
            "🧠",
            group.title,
            group.summary,
            `
              <div class="special-grid">
                ${group.items.map((item) => `
                  <div class="mnemonic-card">
                    <small>Macete</small>
                    <p class="mnemonic-phrase">${item.phrase}</p>
                    <p>${item.explanation}</p>
                  </div>
                `).join("")}
              </div>
            `
          )).join("")}
        </div>
        <aside class="rail-column">${renderChecklistRail({
          highlights: [
            "FC anda de 20 em 20 nos graus de perda volemica.",
            "1A e arteria, 1B esta babando.",
            "Bebeu-vomitou-sangrou ainda resolve muita questao."
          ],
          related: ["armadilhas", "quiz", "flashcards"]
        })}</aside>
      </div>
    `;

    wireChecklistActions();
  }

  function renderPitfallsPage() {
    if (!pageHost) return;

    pageHost.innerHTML = `
      <section class="hero">
        <div class="hero__copy">
          <span class="section-kicker">Antierro</span>
          <h1>Pegadinhas que derrubam questao boa</h1>
          <p>Este bloco neutraliza erros recorrentes: chamar hematoquezia de definicao de HDB, trocar doenca diverticular por diverticulite ou esquecer a cirurgia correta do Meckel sangrante.</p>
          <div class="tag-row"><span class="tag tag--warning">Leitura obrigatoria</span></div>
        </div>
        <div class="hero__aside">
          <div class="hero-stats">
            <div class="stat-card animate-ready">
              <div class="metric-label">Tempo util</div>
              <strong>10 minutos</strong>
              <p>Uma passada aqui antes da prova costuma render mais do que releitura passiva.</p>
            </div>
          </div>
        </div>
      </section>
      <div class="page-grid">
        <div class="main-column">
          ${renderSectionCard(
            "⚠",
            "Armadilhas do modulo",
            "Cada card traz o erro e a forma certa de escapar.",
            `
              <div class="tip-grid">
                ${PITFALLS.map((trap) => `
                  <div class="tip-card tip-card--trap animate-ready">
                    <div class="tip-card__icon">⚠</div>
                    <div>
                      <h3>${trap.title}</h3>
                      <p>${trap.body}</p>
                      <p><strong>Como evitar:</strong> ${trap.fix}</p>
                    </div>
                  </div>
                `).join("")}
              </div>
            `
          )}
        </div>
        <aside class="rail-column">${renderChecklistRail({
          highlights: [
            "Sangue vivo nao carimba baixo.",
            "SNG nao e ritual obrigatorio da HDA.",
            "Meckel sangrante nao se resolve com diverticulectomia isolada."
          ],
          related: ["comparacoes", "mnemonicos", "quiz"]
        })}</aside>
      </div>
    `;

    wireChecklistActions();
  }

  function renderQuickReviewPage() {
    if (!pageHost) return;

    pageHost.innerHTML = `
      <section class="hero">
        <div class="hero__copy">
          <span class="section-kicker">Vespera de prova</span>
          <h1>Revisao rapida para amarrar o modulo inteiro</h1>
          <p>Esta pagina condensa os contrastes e checkpoints mais cobrados sem transformar a aula em resumo anemico. E pagina de fechamento, nao substituto do estudo das paginas clinicas.</p>
          <div class="tag-row">
            <span class="tag tag--accent">Tabelas essenciais</span>
            <span class="tag tag--success">Leitura de fechamento</span>
          </div>
        </div>
        <div class="hero__aside">
          <div class="hero-stats">
            <div class="stat-card animate-ready">
              <div class="metric-label">Uso ideal</div>
              <strong>Pos-questoes</strong>
              <p>Volte aqui depois de errar e corrigir para amarrar o modulo inteiro.</p>
            </div>
          </div>
        </div>
      </section>
      <div class="page-grid">
        <div class="main-column">
          ${REVIEW_TABLES.map((table) => renderSectionCard(
            "📋",
            table.title,
            table.description,
            `
              <div class="table-wrap">
                <table class="comparison-table">
                  <thead><tr>${table.headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
                  <tbody>${table.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
                </table>
              </div>
            `
          )).join("")}
          ${renderSectionCard(
            "🎯",
            "Checklist final de prova",
            "Se as frases abaixo sairem sem hesitacao, voce esta muito bem no modulo.",
            renderBullets([
              "Na hemorragia digestiva, primeiro vem estabilizacao e so depois vem a pergunta alta ou baixa.",
              "Hematemese define HDA; melena sugere HDA; hematoquezia sugere HDB, mas pode ser alta volumosa.",
              "EDA manda na HDA; colonoscopia manda na HDB estavel.",
              "Doenca ulcerosa peptica e a principal causa de HDA e de hemorragia digestiva como um todo.",
              "Doenca diverticular dos colons e a principal causa de HDB; diverticulite e outra resposta.",
              "Forrest 1 e ativo; 2A e vaso visivel; 2B e coagulo aderido; base limpa e risco baixo.",
              "No Meckel sangrante, o delgado adjacente entra na resseccao porque e ali que o sangue nasce."
            ])
          )}
        </div>
        <aside class="rail-column">${renderChecklistRail({
          highlights: [
            "Se travou no sinal, volte para a tabela HDA x HDB.",
            "Se travou no exame, volte para colonoscopia x angio.",
            "Se travou na pediatria, volte para Meckel."
          ],
          related: ["comparacoes", "quiz", "flashcards"]
        })}</aside>
      </div>
    `;

    wireChecklistActions();
  }

  function renderUpdatesPage() {
    if (!pageHost) return;

    pageHost.innerHTML = `
      <section class="hero">
        <div class="hero__copy">
          <span class="section-kicker">Casos que integram o modulo</span>
          <h1>Onde o raciocinio inteiro precisa aparecer de uma vez</h1>
          <p>Esta pagina costura estabilizacao, topografia, exame e etiologia em cenarios sinteticos. Nao e resumo curto; e treino de decisao compacta.</p>
          <div class="tag-row">
            <span class="tag tag--warning">${UPDATE_ITEMS.length} casos guiados</span>
            <span class="tag tag--accent">Integracao final</span>
          </div>
        </div>
        <div class="hero__aside">
          <div class="hero-stats">
            <div class="stat-card animate-ready">
              <div class="metric-label">Como usar</div>
              <strong>Fechamento</strong>
              <p>Leia depois das paginas clinicas para ver a ordem de raciocinio sem perder densidade.</p>
            </div>
          </div>
        </div>
      </section>
      <div class="page-grid">
        <div class="main-column">
          ${renderSectionCard(
            "CAS",
            "Casos integradores do modulo",
            "Cada card abaixo foi escrito para condensar a virada de raciocinio que a prova costuma exigir.",
            `
              <div class="updates-grid">
                ${UPDATE_ITEMS.map((item) => `
                  <article class="update-card animate-ready">
                    <div class="update-card__head">
                      <span class="tag tag--warning">${item.kicker}</span>
                      <span class="source-link">${item.sourceLabel}</span>
                    </div>
                    <h3>${item.title}</h3>
                    <p>${item.body}</p>
                    <div class="update-card__impact">
                      <strong>Virada de decisao</strong>
                      <p>${item.impact}</p>
                    </div>
                  </article>
                `).join("")}
              </div>
            `
          )}
          ${renderSectionCard(
            "GUI",
            "Como usar os casos sem reduzir a aula",
            "O melhor uso desta pagina e depois do estudo-base, para ver se a sequencia de decisao ficou realmente automatica.",
            renderBullets([
              "Leia o caso e tente responder antes de abrir o comentario do card.",
              "Se travar em topografia, volte para HDA x HDB antes de decorar etiologia.",
              "Se travar em exame, revise o bloco colonoscopia x cintilografia x angio."
            ])
          )}
        </div>
        <aside class="rail-column">${renderChecklistRail({
          highlights: [
            "Caso bom mistura estabilizacao e topografia.",
            "A banca adora mudar o exame e nao a doenca.",
            "Se a historia e tipica, respeite a narrativa."
          ],
          related: ["abordagem-inicial", "hemorragia-digestiva-alta", "revisao-rapida"]
        })}</aside>
      </div>
    `;

    wireChecklistActions();
  }

  function renderQuizPage() {
    if (!pageHost) return;

    pageHost.innerHTML = `
      <section class="hero">
        <div class="hero__copy">
          <span class="section-kicker">Questoes de alto rendimento</span>
          <h1>${QUIZ_COUNT} questoes com feedback imediato</h1>
          <p>As questoes abaixo foram escritas para simular o tipo de decisao que mais cai em hemorragia digestiva: prioridade de conduta, topografia, escolha de exame e etiologia classica.</p>
          <div class="tag-row">
            <span class="tag tag--accent">${QUIZ_COUNT} questoes</span>
            <span class="tag tag--warning">Meta sugerida: 80% ou mais</span>
          </div>
        </div>
        <div class="hero__aside">
          <div class="hero-stats">
            <div class="stat-card animate-ready">
              <div class="metric-label">Melhor nota</div>
              <strong>${state.quiz.best}%</strong>
              <p>Seu melhor resultado fica salvo localmente.</p>
            </div>
          </div>
        </div>
      </section>
      <div class="page-grid">
        <div class="main-column">
          <div class="quiz-shell animate-ready">
            <div class="quiz-toolbar">
              <div class="quiz-progress">
                <div class="metric-label">Progresso</div>
                <div class="progress-track"><div class="progress-fill" id="quizProgressFill" style="width:0%"></div></div>
                <div class="stats-row"><span id="quizProgressText">0/${QUIZ_COUNT} respondidas</span><span>${QUIZ_COUNT} questoes</span></div>
              </div>
              <div class="button-row">
                <button class="btn btn--primary" id="startQuiz" type="button">Iniciar em ordem</button>
                <button class="btn btn--ghost" id="shuffleQuiz" type="button">Modo aleatorio</button>
              </div>
            </div>
            <div id="quizApp" class="quiz-card"><p class="subtle">Clique em um modo para comecar. Aqui a justificativa faz parte do estudo, nao e enfeite.</p></div>
            <div id="quizResults" class="quiz-results"></div>
          </div>
        </div>
        <aside class="rail-column">${renderChecklistRail({
          highlights: [
            "Leia o feedback mesmo quando acertar.",
            "Questao facil errada vale mais revisao do que questao dificil acertada por chute.",
            "Refazer em modo aleatorio testa retencao real."
          ],
          related: ["comparacoes", "flashcards", "revisao-rapida"]
        })}</aside>
      </div>
    `;

    wireChecklistActions();

    let questions = QUIZ_QUESTIONS.slice();
    let index = 0;
    let answers = [];

    const app = document.getElementById("quizApp");
    const results = document.getElementById("quizResults");
    const progressFill = document.getElementById("quizProgressFill");
    const progressText = document.getElementById("quizProgressText");

    function updateProgress() {
      const percent = Math.round((answers.length / questions.length) * 100);
      progressFill.style.width = `${percent}%`;
      progressText.textContent = `${answers.length}/${questions.length} respondidas`;
    }

    function showResults() {
      const correctCount = answers.filter((entry) => entry.correct).length;
      const percent = Math.round((correctCount / questions.length) * 100);
      const wrong = answers.filter((entry) => !entry.correct);

      state.quiz.best = Math.max(state.quiz.best || 0, percent);
      state.quiz.last = percent;
      state.quiz.runs += 1;
      state.reviewedPages.quiz = true;
      state.checklists.quiz = state.checklists.quiz || {};
      state.checklists.quiz.rodada = true;
      state.checklists.quiz.feedback = true;
      if (percent >= 80) {
        state.checklists.quiz.meta80 = true;
      }
      saveState();

      renderSidebar();
      renderTopbar();
      wireShell();

      app.innerHTML = "";
      results.classList.add("is-visible");
      results.innerHTML = `
        <div class="quiz-result-card">
          <div class="metric-label">Resultado</div>
          <div class="score">${percent}%</div>
          <p>${correctCount} de ${questions.length} questoes corretas.</p>
        </div>
        <div class="button-row">
          <button class="btn btn--primary" id="retryQuiz" type="button">Refazer em ordem</button>
          <button class="btn btn--ghost" id="retryRandom" type="button">Refazer aleatorio</button>
        </div>
        <div class="quiz-summary">
          ${wrong.length ? wrong.map((entry) => `
            <div class="quiz-result-card">
              <h4>${entry.item.question}</h4>
              <p><strong>Correta:</strong> ${entry.item.options[entry.item.correct]}</p>
              <p>${entry.item.explanation}</p>
            </div>
          `).join("") : `
            <div class="quiz-result-card">
              <h4>Rodada sem erros</h4>
              <p>Excelente sinal. Agora vale revisar so as armadilhas e marcar no deck o que ainda nao veio automatico.</p>
            </div>
          `}
        </div>
      `;

      document.getElementById("retryQuiz").addEventListener("click", () => startQuiz(false));
      document.getElementById("retryRandom").addEventListener("click", () => startQuiz(true));
    }

    function renderQuestion() {
      updateProgress();
      results.classList.remove("is-visible");
      results.innerHTML = "";

      if (!questions[index]) {
        showResults();
        return;
      }

      const item = questions[index];
      app.innerHTML = `
        <div class="quiz-card">
          <div class="quiz-card__header">
            <span class="question-index">${index + 1}</span>
            <div>
              <div class="card-kicker">${item.topic} · ${item.difficulty}</div>
              <p class="quiz-question-text">${item.question}</p>
              <p class="subtle">${item.banca}</p>
            </div>
          </div>
          <div class="answer-list">
            ${item.options.map((option, optionIndex) => `
              <button class="answer-btn" type="button" data-answer-index="${optionIndex}">
                ${String.fromCharCode(65 + optionIndex)}. ${option}
              </button>
            `).join("")}
          </div>
          <div class="hidden" id="quizFeedback"></div>
          <div class="button-row hidden" id="quizNextRow">
            <button class="btn btn--primary" id="nextQuestion" type="button">${index === questions.length - 1 ? "Ver resultado" : "Proxima questao"}</button>
          </div>
        </div>
      `;

      app.querySelectorAll("[data-answer-index]").forEach((button) => {
        button.addEventListener("click", () => {
          const selected = Number(button.getAttribute("data-answer-index"));
          const correct = selected === item.correct;
          app.querySelectorAll("[data-answer-index]").forEach((node, nodeIndex) => {
            node.disabled = true;
            if (nodeIndex === item.correct) node.classList.add("is-correct");
            if (!correct && nodeIndex === selected) node.classList.add("is-wrong");
          });
          answers.push({ item, correct });
          const feedback = document.getElementById("quizFeedback");
          const nextRow = document.getElementById("quizNextRow");
          feedback.className = correct ? "feedback-box feedback-box--good" : "feedback-box feedback-box--bad";
          feedback.innerHTML = `<strong>${correct ? "Correto." : "Incorreto."}</strong> ${item.explanation}`;
          nextRow.classList.remove("hidden");
          updateProgress();
        });
      });

      document.getElementById("nextQuestion").addEventListener("click", () => {
        index += 1;
        renderQuestion();
      });
    }

    function startQuiz(randomize) {
      questions = QUIZ_QUESTIONS.slice();
      if (randomize) {
        questions.sort(() => Math.random() - 0.5);
      }
      index = 0;
      answers = [];
      renderQuestion();
    }

    document.getElementById("startQuiz").addEventListener("click", () => startQuiz(false));
    document.getElementById("shuffleQuiz").addEventListener("click", () => startQuiz(true));
  }

  function renderFlashcardsPage() {
    if (!pageHost) return;

    pageHost.innerHTML = `
      <section class="hero">
        <div class="hero__copy">
          <span class="section-kicker">Active recall premium</span>
          <h1>${FLASHCARD_COUNT} flashcards com flip 3D e memoria de progresso</h1>
          <p>Este deck foi desenhado para revisao de prova. Passe pelos cards como se estivesse sozinho diante da questao: formule a resposta antes de virar, marque como dificil sem culpa e use a persistencia local para encontrar seus gargalos.</p>
          <div class="tag-row">
            <span class="tag tag--purple">${FLASHCARD_COUNT} cards</span>
            <span class="tag tag--accent">Categorias misturadas</span>
          </div>
        </div>
        <div class="hero__aside">
          <div class="hero-stats">
            <div class="stat-card animate-ready">
              <div class="metric-label">Vistos</div>
              <strong>${getFlashcardStats().seen}/${FLASHCARD_COUNT}</strong>
              <p>Os dados do deck ficam salvos localmente.</p>
            </div>
          </div>
        </div>
      </section>
      <div class="page-grid">
        <div class="main-column">
          <div class="flash-shell animate-ready" id="flashcardsSection">
            <div class="flash-toolbar">
              <div class="flash-progress">
                <div class="metric-label">Progresso do deck</div>
                <div class="progress-track"><div class="progress-fill" id="flashProgressFill" style="width:0%"></div></div>
                <div class="stats-row"><span id="flashProgressText">0/${FLASHCARD_COUNT} vistos</span><span id="flashCountText">1/${FLASHCARD_COUNT}</span></div>
              </div>
            </div>
            <div class="flash-body" id="flashApp"></div>
          </div>
        </div>
        <aside class="rail-column">${renderChecklistRail({
          highlights: [
            "Vire o card so depois de tentar responder.",
            "Marque dificil tudo o que nao veio automatico.",
            "Misturar categorias testa evocacao real."
          ],
          related: ["quiz", "revisao-rapida", "mnemonicos"]
        })}</aside>
      </div>
    `;

    wireChecklistActions();

    let currentIndex = 0;

    function getCardState(card) {
      state.flashcards.cards[card.front] = state.flashcards.cards[card.front] || { seen: false, difficult: false };
      return state.flashcards.cards[card.front];
    }

    function syncHeader() {
      renderSidebar();
      renderTopbar();
      wireShell();
    }

    function renderCard() {
      const app = document.getElementById("flashApp");
      if (!app) return;
      const card = FLASHCARDS[currentIndex];
      const cardState = getCardState(card);
      const stats = getFlashcardStats();

      document.getElementById("flashProgressFill").style.width = `${stats.total ? Math.round((stats.seen / stats.total) * 100) : 0}%`;
      document.getElementById("flashProgressText").textContent = `${stats.seen}/${stats.total} vistos`;
      document.getElementById("flashCountText").textContent = `${currentIndex + 1}/${FLASHCARD_COUNT}`;

      app.innerHTML = `
        <div class="flashcard-scene">
          <div class="flashcard-unit" id="flashUnit">
            <div class="flashcard-face flashcard-face--front">
              <span class="category-pill">${card.category}</span>
              <h3>${card.front}</h3>
              <p class="subtle">Clique no card ou no botao abaixo para virar.</p>
            </div>
            <div class="flashcard-face flashcard-face--back">
              <span class="category-pill">${card.category} · ${card.importance}</span>
              <p>${card.back}</p>
            </div>
          </div>
        </div>
        <div class="flash-controls">
          <button class="btn btn--primary" id="flipCard" type="button">Virar card</button>
          <button class="btn btn--ghost" id="prevCard" type="button">← Anterior</button>
          <button class="btn btn--ghost" id="nextCard" type="button">Proximo →</button>
        </div>
        <div class="status-row">
          <button class="status-toggle ${cardState.seen ? "is-active" : ""}" id="markSeen" type="button">Concluido</button>
          <button class="status-toggle ${cardState.difficult ? "is-active" : ""}" id="markDifficult" type="button">Dificil</button>
        </div>
      `;

      function flip() {
        document.getElementById("flashUnit").classList.toggle("is-flipped");
      }

      document.getElementById("flipCard").addEventListener("click", flip);
      document.getElementById("flashUnit").addEventListener("click", flip);
      document.getElementById("prevCard").addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + FLASHCARD_COUNT) % FLASHCARD_COUNT;
        renderCard();
      });
      document.getElementById("nextCard").addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % FLASHCARD_COUNT;
        renderCard();
      });
      document.getElementById("markSeen").addEventListener("click", () => {
        const current = getCardState(card);
        current.seen = !current.seen;
        saveState();
        refreshToolFlags();
        syncHeader();
        renderCard();
      });
      document.getElementById("markDifficult").addEventListener("click", () => {
        const current = getCardState(card);
        current.difficult = !current.difficult;
        saveState();
        refreshToolFlags();
        syncHeader();
        renderCard();
      });
    }

    renderCard();
  }

  function renderNotFound() {
    if (!pageHost) return;
    pageHost.innerHTML = `
      <section class="hero">
        <div class="hero__copy">
          <span class="section-kicker">Pagina nao encontrada</span>
          <h1>O id desta pagina nao foi mapeado</h1>
          <p>Volte ao dashboard e reabra o modulo a partir da trilha principal.</p>
          <div class="button-row">
            <a class="btn btn--primary" href="${resolvePath(PAGE_META.dashboard.href)}">Voltar ao dashboard</a>
          </div>
        </div>
      </section>
    `;
  }

  function initAnimations() {
    const nodes = document.querySelectorAll(".animate-ready");
    if (!nodes.length || typeof IntersectionObserver === "undefined") {
      nodes.forEach((node) => node.classList.add("animate-in"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    nodes.forEach((node) => observer.observe(node));
  }

  function rerender(anchorId) {
    const scrollY = window.scrollY;
    renderSidebar();
    renderTopbar();
    wireShell();
    route();
    initAnimations();
    if (anchorId) {
      requestAnimationFrame(() => {
        const anchor = document.getElementById(anchorId);
        if (anchor) anchor.scrollIntoView({ block: "start" });
      });
      return;
    }
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY });
    });
  }

  function route() {
    switch (pageId) {
      case "dashboard":
        renderDashboard();
        break;
      case "comparacoes":
        renderComparisonsPage();
        break;
      case "fluxogramas":
        renderFlowPage();
        break;
      case "mnemonicos":
        renderMnemonicsPage();
        break;
      case "armadilhas":
        renderPitfallsPage();
        break;
      case "quiz":
        renderQuizPage();
        break;
      case "flashcards":
        renderFlashcardsPage();
        break;
      case "revisao-rapida":
        renderQuickReviewPage();
        break;
      case "atualizacoes":
        renderUpdatesPage();
        break;
      default:
        if (CLINICAL_PAGES[pageId]) {
          renderClinicalPage(pageId);
        } else {
          renderNotFound();
        }
        break;
    }
  }

  refreshToolFlags();
  renderSidebar();
  renderTopbar();
  wireShell();
  route();
  initAnimations();
}());
