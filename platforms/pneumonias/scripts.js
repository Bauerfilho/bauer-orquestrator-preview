(function () {
  const data = window.PLATFORM_DATA;
  const pageHost = document.getElementById("pageHost");

  if (!data) {
    if (pageHost) {
      pageHost.innerHTML = `
        <section class="hero">
          <div class="hero__copy">
            <span class="section-kicker">Erro de carregamento</span>
            <h1>Os dados da plataforma nao foram encontrados</h1>
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

  const STORAGE_KEY = "plataforma-oncoginecologia-colo-endometrio-v1";
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
      dashboardSubtitle: "Porta de entrada: suspeita clínica e a classificação que nomeia o tipo de pneumonia."
    },
    {
      id: "reconhecimento",
      title: "Reconhecimento e Imagem",
      dashboardTitle: "Reconhecer a Pneumonia",
      dashboardSubtitle: "Semiologia da consolidação, diferenciais, radiografia e pérolas de imagem que apontam o patógeno."
    },
    {
      id: "gravidade",
      title: "Gravidade e Investigação",
      dashboardTitle: "Decidir o Sítio de Tratamento",
      dashboardSubtitle: "CURB-65, critérios ATS/IDSA e quando a investigação etiológica deixa de ser opcional."
    },
    {
      id: "etiologia",
      title: "Raciocínio Etiológico",
      dashboardTitle: "Típicos e Atípicos",
      dashboardSubtitle: "Definição real de típico × atípico, principais agentes e os contextos clínicos que mudam a cobertura."
    },
    {
      id: "tratamento",
      title: "Tratamento Empírico",
      dashboardTitle: "Cobertura por Sítio",
      dashboardSubtitle: "PAC ambulatorial, enfermaria, UTI, pneumonia hospitalar e associada à ventilação — cada contexto com sua lógica."
    },
    {
      id: "complicacoes",
      title: "Complicações",
      dashboardTitle: "Quando o Antibiótico Não Basta",
      dashboardSubtitle: "Derrame parapneumônico, Light, drenagem, abscesso, pneumonia necrosante e aspiração química."
    },
    {
      id: "influenza",
      title: "Influenza",
      dashboardTitle: "Diferencial Viral",
      dashboardSubtitle: "Síndrome gripal e SRAG, diagnóstico, oseltamivir, vacinação e coinfecção bacteriana pós-influenza."
    },
    {
      id: "ferramentas",
      title: "Ferramentas",
      dashboardTitle: "Ferramentas de Retenção",
      dashboardSubtitle: "Comparações, fluxos, macetes, armadilhas, banco de questões, flashcards e revisão final."
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
  document.body.dataset.theme = pageMeta.theme || "teal";
  document.body.classList.toggle("sidebar-collapsed", Boolean(state.sidebar.collapsed));

  // Dark mode
  const DARK_KEY = "plataforma-dark-mode";
  function isDark() { return localStorage.getItem(DARK_KEY) === "true"; }
  function applyDark(val) { document.body.classList.toggle("dark-mode", Boolean(val)); }
  function toggleDark() { const next = !isDark(); localStorage.setItem(DARK_KEY, next); applyDark(next); rerender(); }
  applyDark(isDark());
  document.title = `${pageMeta.title} · ${APP_CONFIG.appName || "Pneumonias Premium"}`;

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
          <a class="brand" href="${resolvePath(PAGE_META.dashboard.href)}" title="${escapeAttr(APP_CONFIG.brandTitle || "Diarreia, DII e Parasitoses")}">
            <span class="brand__orb">${APP_CONFIG.brandOrb || "GI"}</span>
            <div class="brand__copy">
              <h1>${APP_CONFIG.brandTitle || "Diarreia, DII e Parasitoses"}</h1>
              <p>${APP_CONFIG.brandSubtitle || "Abordagem sindromica, ma absorcao, parasitoses e DII com navegacao premium"}</p>
            </div>
          </a>
          <div class="sidebar-toolbar">
            <span class="sidebar-kicker">${APP_CONFIG.brandKicker || "premium • gastro • prova • retencao"}</span>
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
          <span class="topbar-kicker">${pageMeta.kindLabel || "guia"}</span>
        </div>
        <h2>${pageMeta.title}</h2>
        <p>${pageMeta.subtitle || ""}</p>
      </div>
      <div class="topbar-actions">
        <span class="pill">${progress.percent}% desta pagina</span>
        <span class="pill">${overall.percent}% da plataforma</span>
        <button class="icon-btn dark-toggle" id="darkToggle" type="button" aria-label="Alternar tema">
          <span class="dark-toggle-label">${isDark() ? "☀️" : "🌙"}</span>
        </button>
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

    const darkToggle = document.getElementById("darkToggle");
    if (darkToggle) {
      darkToggle.addEventListener("click", toggleDark);
    }
  }

  let topbarAutohideBound = false;
  let lastScrollY = window.scrollY || 0;

  function initTopbarAutohide() {
    if (topbarAutohideBound) return;
    topbarAutohideBound = true;

    let ticking = false;

    function updateTopbarState() {
      const currentY = window.scrollY || 0;
      const delta = currentY - lastScrollY;

      if (currentY < 72) {
        document.body.classList.remove("topbar-hidden");
        lastScrollY = currentY;
        ticking = false;
        return;
      }

      if (delta > 12) {
        document.body.classList.add("topbar-hidden");
        lastScrollY = currentY;
      } else if (delta < -8) {
        document.body.classList.remove("topbar-hidden");
        lastScrollY = currentY;
      }

      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateTopbarState);
    }, { passive: true });
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
    const headers = section.headers || [];
    return renderSectionCard(
      section.icon || "⇄",
      section.title,
      section.subtitle,
      `
        <div class="table-wrap">
          <table class="comparison-table">
            <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
            <tbody>${section.rows.map((row) => `
              <tr>${row.map((cell, index) => `<td data-label="${escapeAttr(headers[index] || "")}">${cell}</td>`).join("")}</tr>
            `).join("")}</tbody>
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

  function renderMnemonicCard(section) {
    return renderSectionCard(
      section.icon || "MAC",
      section.title,
      section.subtitle,
      `
        <div class="mnemonic-stack">
          ${section.items.map((item) => `
            <div class="mnemonic-panel mnemonic-panel--${item.tone || "accent"}">
              ${item.label ? `<span class="mnemonic-panel__label">${item.label}</span>` : ""}
              <div class="mnemonic-panel__phrase">${item.phrase}</div>
              <p class="mnemonic-panel__meaning">${item.meaning}</p>
              ${item.support ? `<p class="mnemonic-panel__support">${item.support}</p>` : ""}
            </div>
          `).join("")}
        </div>
      `,
      "section-card--mnemonic"
    );
  }

  function renderPitfallsCard(section) {
    return renderSectionCard(
      section.icon || "ALT",
      section.title,
      section.subtitle,
      `
        <div class="pitfall-grid">
          ${section.items.map((item) => `
            <div class="pitfall-card">
              <div class="pitfall-card__row">
                <span class="pitfall-chip pitfall-chip--danger">Erro comum</span>
                <p>${item.error}</p>
              </div>
              <div class="pitfall-card__row">
                <span class="pitfall-chip pitfall-chip--warning">Por que esta errado</span>
                <p>${item.why}</p>
              </div>
              <div class="pitfall-card__row">
                <span class="pitfall-chip pitfall-chip--success">Como evitar</span>
                <p>${item.avoid}</p>
              </div>
            </div>
          `).join("")}
        </div>
      `,
      "section-card--pitfall"
    );
  }

  function renderDecisionFlowCard(section) {
    const entry = section.entry ? `
      <div class="decision-flow__entry">
        <span class="decision-flow__eyebrow">${section.entry.label || "Entrada"}</span>
        <strong>${section.entry.title}</strong>
        ${section.entry.text ? `<p>${section.entry.text}</p>` : ""}
      </div>
    ` : "";

    return renderSectionCard(
      section.icon || "FLX",
      section.title,
      section.subtitle,
      `
        <div class="decision-flow">
          ${entry}
          <div class="decision-flow__steps">
            ${section.steps.map((step, index) => `
              <div class="decision-step">
                <div class="decision-step__head">
                  <span class="decision-step__index">${index + 1}</span>
                  <div>
                    ${step.kicker ? `<span class="decision-flow__eyebrow">${step.kicker}</span>` : ""}
                    <h4>${step.title}</h4>
                    ${step.prompt ? `<p>${step.prompt}</p>` : ""}
                  </div>
                </div>
                <div class="decision-step__branches">
                  <div class="decision-branch decision-branch--yes">
                    <span class="decision-branch__label">${step.yesLabel || "Se sim"}</span>
                    <p>${step.yes}</p>
                  </div>
                  <div class="decision-branch decision-branch--no">
                    <span class="decision-branch__label">${step.noLabel || "Se nao"}</span>
                    <p>${step.no}</p>
                  </div>
                </div>
                ${step.note ? `<div class="decision-step__note">${step.note}</div>` : ""}
              </div>
            `).join("")}
          </div>
        </div>
      `,
      "section-card--flow"
    );
  }

  function renderAccordionCard(section) {
    return renderSectionCard(
      section.icon || "DET",
      section.title,
      section.subtitle,
      `
        <div class="accordion-list">
          ${section.items.map((item, index) => `
            <details class="accordion-item" ${item.open || index === 0 ? "open" : ""}>
              <summary class="accordion-item__summary">
                <div>
                  <strong>${item.title}</strong>
                  ${item.summary ? `<p>${item.summary}</p>` : ""}
                </div>
                <span class="accordion-item__chevron">⌄</span>
              </summary>
              <div class="accordion-item__body">
                ${item.paragraphs && item.paragraphs.length ? renderParagraphs(item.paragraphs) : ""}
                ${item.bullets && item.bullets.length ? renderBullets(item.bullets) : ""}
              </div>
            </details>
          `).join("")}
        </div>
      `,
      "section-card--accordion"
    );
  }


  // ============================================================
  // IMAGING TREE — Raciocínio clínico visual com hotspots
  // ============================================================
  const imagingCache = new Map();

  function buildColonoscopyMucosaSVG() {
    return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="scopeGrad" cx="45%" cy="42%" r="56%">
          <stop offset="0%" stop-color="#1a0a06"/>
          <stop offset="40%" stop-color="#0d0503"/>
          <stop offset="100%" stop-color="#000"/>
        </radialGradient>
        <radialGradient id="ilumGrad" cx="42%" cy="38%" r="44%">
          <stop offset="0%" stop-color="rgba(255,230,200,0.18)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
        </radialGradient>
        <clipPath id="scopeClip"><circle cx="200" cy="200" r="186"/></clipPath>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <!-- Anel externo do endoscópio -->
      <circle cx="200" cy="200" r="196" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="200" r="186" fill="url(#scopeGrad)"/>
      <!-- Mucosa base — textura rosada -->
      <g clip-path="url(#scopeClip)">
        <ellipse cx="200" cy="210" rx="148" ry="138" fill="#8B3A2A" opacity="0.7"/>
        <ellipse cx="195" cy="205" rx="132" ry="122" fill="#A04535" opacity="0.6"/>
        <!-- Pregas mucosas principais -->
        <path d="M 90 150 Q 130 120 160 145 Q 190 165 220 148 Q 255 128 280 155" fill="none" stroke="#C06050" stroke-width="5" stroke-linecap="round" opacity="0.65"/>
        <path d="M 100 200 Q 145 178 175 195 Q 210 215 245 198 Q 278 180 300 205" fill="none" stroke="#B05545" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
        <path d="M 108 250 Q 150 230 182 248 Q 215 268 252 248 Q 282 232 308 255" fill="none" stroke="#B05545" stroke-width="4" stroke-linecap="round" opacity="0.55"/>
        <!-- Vasos submucosos sutis -->
        <path d="M 160 130 Q 175 160 170 185 Q 168 205 175 225" fill="none" stroke="#7A2820" stroke-width="1.5" opacity="0.5"/>
        <path d="M 220 135 Q 230 158 225 182 Q 222 200 230 220" fill="none" stroke="#7A2820" stroke-width="1.5" opacity="0.5"/>
        <path d="M 270 165 Q 278 188 272 210 Q 268 228 275 248" fill="none" stroke="#7A2820" stroke-width="1.2" opacity="0.4"/>
        <!-- Achado 1: Úlceras aftóides (salteadas) — zona superior-esquerda -->
        <ellipse cx="148" cy="155" rx="9" ry="6" fill="#F5C8A0" opacity="0.9" filter="url(#glow)"/>
        <ellipse cx="148" cy="155" rx="5" ry="3" fill="#FFFAE0"/>
        <circle cx="148" cy="155" r="11" fill="none" stroke="#E87060" stroke-width="1.5" opacity="0.7"/>
        <!-- Úlcera aftóide menor -->
        <ellipse cx="170" cy="168" rx="6" ry="4" fill="#F5C8A0" opacity="0.8"/>
        <ellipse cx="170" cy="168" rx="3" ry="2" fill="#FFFAE0"/>
        <circle cx="170" cy="168" r="8" fill="none" stroke="#E87060" stroke-width="1.2" opacity="0.6"/>
        <!-- Mucosa NORMAL entre as úlceras — destaque -->
        <ellipse cx="210" cy="162" rx="20" ry="14" fill="#A84840" opacity="0.3"/>
        <!-- Achado 2: Padrão calçamento (cobblestone) — zona central-direita -->
        <g transform="translate(248,190)">
          <rect x="-18" y="-12" width="10" height="8" rx="2" fill="#C06858" opacity="0.85" stroke="#D07868" stroke-width="0.5"/>
          <rect x="-6" y="-14" width="10" height="7" rx="2" fill="#B85848" opacity="0.85" stroke="#C86858" stroke-width="0.5"/>
          <rect x="6" y="-12" width="9" height="8" rx="2" fill="#C06858" opacity="0.8" stroke="#D07868" stroke-width="0.5"/>
          <rect x="-20" y="-2" width="10" height="9" rx="2" fill="#B05040" opacity="0.85" stroke="#C06050" stroke-width="0.5"/>
          <rect x="-8" y="-4" width="11" height="8" rx="2" fill="#C86860" opacity="0.9" stroke="#D87870" stroke-width="0.5"/>
          <rect x="5" y="-2" width="10" height="9" rx="2" fill="#B85848" opacity="0.85" stroke="#C86858" stroke-width="0.5"/>
          <rect x="-18" y="9" width="10" height="8" rx="2" fill="#C06858" opacity="0.8" stroke="#D07868" stroke-width="0.5"/>
          <rect x="-6" y="7" width="10" height="9" rx="2" fill="#B05040" opacity="0.85" stroke="#C06050" stroke-width="0.5"/>
          <rect x="6" y="9" width="9" height="8" rx="2" fill="#C06858" opacity="0.8" stroke="#D07868" stroke-width="0.5"/>
        </g>
        <!-- Achado 3: Comprometimento contínuo — zona inferior, eritema difuso -->
        <ellipse cx="185" cy="275" rx="72" ry="28" fill="#E05848" opacity="0.35"/>
        <ellipse cx="185" cy="275" rx="55" ry="20" fill="#CC4838" opacity="0.25"/>
        <!-- Pontos hemorrágicos no eritema contínuo -->
        <circle cx="162" cy="272" r="3" fill="#AA2010" opacity="0.8"/>
        <circle cx="178" cy="278" r="2.5" fill="#AA2010" opacity="0.7"/>
        <circle cx="195" cy="270" r="3" fill="#AA2010" opacity="0.8"/>
        <circle cx="210" cy="276" r="2.5" fill="#AA2010" opacity="0.7"/>
        <!-- Iluminação central do endoscópio -->
        <ellipse cx="185" cy="175" rx="90" ry="80" fill="url(#ilumGrad)"/>
        <!-- Reflexo de luz da lente -->
        <circle cx="158" cy="148" r="14" fill="white" opacity="0.06"/>
        <circle cx="155" cy="145" r="6" fill="white" opacity="0.10"/>
      </g>
      <!-- Borda do endoscópio -->
      <circle cx="200" cy="200" r="186" fill="none" stroke="#2a2a2a" stroke-width="3"/>
      <circle cx="200" cy="200" r="196" fill="none" stroke="#111" stroke-width="4"/>
    </svg>`;
  }

  function buildXRayAbdomenSVG() {
    return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="xrBg" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#2a2a2a"/>
          <stop offset="100%" stop-color="#0a0a0a"/>
        </radialGradient>
        <filter id="xrBlur"><feGaussianBlur stdDeviation="2.5"/></filter>
        <filter id="xrSoft"><feGaussianBlur stdDeviation="1.2"/></filter>
      </defs>
      <rect width="400" height="400" fill="#080808"/>
      <!-- Corpo silhueta -->
      <ellipse cx="200" cy="210" rx="140" ry="170" fill="#1a1a1a" opacity="0.8"/>
      <!-- Costelas -->
      <g opacity="0.55" fill="none" stroke="#888" stroke-width="2.5" stroke-linecap="round">
        <path d="M 115 95 Q 100 120 108 148"/>
        <path d="M 115 108 Q 98 135 107 162"/>
        <path d="M 118 122 Q 100 150 110 176"/>
        <path d="M 285 95 Q 300 120 292 148"/>
        <path d="M 285 108 Q 302 135 293 162"/>
        <path d="M 282 122 Q 300 150 290 176"/>
      </g>
      <!-- Coluna vertebral -->
      <rect x="186" y="80" width="28" height="260" rx="4" fill="#666" opacity="0.5" filter="url(#xrSoft)"/>
      <g opacity="0.6">
        <rect x="183" y="85" width="34" height="18" rx="3" fill="#888"/>
        <rect x="183" y="108" width="34" height="18" rx="3" fill="#888"/>
        <rect x="183" y="131" width="34" height="18" rx="3" fill="#888"/>
        <rect x="183" y="154" width="34" height="18" rx="3" fill="#888"/>
        <rect x="183" y="177" width="34" height="18" rx="3" fill="#888"/>
        <rect x="183" y="200" width="34" height="18" rx="3" fill="#888"/>
        <rect x="183" y="223" width="34" height="18" rx="3" fill="#888"/>
        <rect x="183" y="246" width="34" height="18" rx="3" fill="#888"/>
        <rect x="183" y="269" width="34" height="18" rx="3" fill="#888"/>
        <rect x="183" y="292" width="34" height="18" rx="3" fill="#888"/>
      </g>
      <!-- Pelve -->
      <ellipse cx="200" cy="330" rx="110" ry="52" fill="none" stroke="#777" stroke-width="4" opacity="0.55" filter="url(#xrSoft)"/>
      <ellipse cx="200" cy="330" rx="70" ry="30" fill="none" stroke="#666" stroke-width="3" opacity="0.45"/>
      <!-- Achado 1: Alças intestinais distendidas -->
      <g opacity="0.6" fill="none" stroke-linecap="round">
        <path d="M 128 175 Q 145 155 168 165 Q 190 175 195 155 Q 200 138 222 148 Q 242 158 250 175" stroke="#4a9" stroke-width="3.5"/>
        <path d="M 127 188 Q 144 168 167 178 Q 188 188 194 168 Q 199 151 221 161 Q 241 171 249 188" stroke="#4a9" stroke-width="2" opacity="0.5"/>
      </g>
      <!-- Achado 2: Nível hidroaéreo (sinal clássico de obstrução) -->
      <rect x="118" y="220" width="64" height="36" rx="5" fill="#1a3a2a" stroke="#2a6a4a" stroke-width="1.5" opacity="0.8"/>
      <line x1="118" y1="238" x2="182" y2="238" stroke="#4a9a6a" stroke-width="2" opacity="0.9"/>
      <rect x="118" y="238" width="64" height="18" rx="3" fill="#0a2a18" opacity="0.6"/>
      <text x="150" y="233" text-anchor="middle" fill="#4a9a6a" font-size="8" font-weight="bold" opacity="0.9">AR</text>
      <text x="150" y="250" text-anchor="middle" fill="#2a6a4a" font-size="8" font-weight="bold" opacity="0.7">LÍQ</text>
      <!-- Achado 3: Gás livre subdiafragmático (pneumoperitônio) -->
      <ellipse cx="145" cy="108" rx="30" ry="14" fill="#1a2a3a" opacity="0.7" stroke="#3a6a9a" stroke-width="1.5"/>
      <text x="145" y="112" text-anchor="middle" fill="#6aaa" font-size="8" font-weight="bold" opacity="0.9">GÁS LIVRE</text>
      <!-- Legendas cantos -->
      <text x="18" y="390" fill="#555" font-size="9" font-weight="bold">RX ABDOME</text>
      <text x="382" y="390" text-anchor="end" fill="#555" font-size="9" font-weight="bold">AP</text>
    </svg>`;
  }

  function buildCTAxialSVG() {
    return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ctBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1a1a1a"/>
          <stop offset="100%" stop-color="#080808"/>
        </radialGradient>
        <filter id="ctBlur"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      <rect width="400" height="400" fill="#050505"/>
      <!-- Corpo corte axial -->
      <ellipse cx="200" cy="210" rx="165" ry="145" fill="#1c1c1c" stroke="#2a2a2a" stroke-width="2"/>
      <!-- Parede abdominal -->
      <ellipse cx="200" cy="210" rx="165" ry="145" fill="none" stroke="#555" stroke-width="6" opacity="0.4"/>
      <!-- Coluna vertebral -->
      <ellipse cx="200" cy="305" rx="22" ry="18" fill="#aaa" opacity="0.7"/>
      <ellipse cx="200" cy="305" rx="14" ry="10" fill="#ccc" opacity="0.8"/>
      <!-- Fígado -->
      <ellipse cx="145" cy="185" rx="75" ry="55" fill="#555" opacity="0.6" filter="url(#ctBlur)"/>
      <!-- Baço -->
      <ellipse cx="265" cy="195" rx="32" ry="26" fill="#4a4a4a" opacity="0.6"/>
      <!-- Aorta -->
      <circle cx="200" cy="280" r="10" fill="#888" opacity="0.5" stroke="#aaa" stroke-width="1.5"/>
      <!-- Achado 1: Espessamento parietal de alça — Crohn -->
      <ellipse cx="155" cy="235" rx="24" ry="18" fill="#2a1a0a" opacity="0.8" stroke="#8a4a1a" stroke-width="2"/>
      <ellipse cx="155" cy="235" rx="18" ry="12" fill="#4a2a0a" opacity="0.5"/>
      <circle cx="155" cy="235" r="7" fill="#0a0a0a" opacity="0.8"/>
      <!-- Achado 2: Hipercaptação de contraste na parede (sinal do alvo) -->
      <ellipse cx="248" cy="242" rx="22" ry="17" fill="#0a1a2a" opacity="0.8" stroke="#2a6a9a" stroke-width="2.5"/>
      <ellipse cx="248" cy="242" rx="16" ry="11" fill="#2a5a8a" opacity="0.5"/>
      <circle cx="248" cy="242" r="6" fill="#0a0a0a" opacity="0.8"/>
      <!-- Achado 3: Gordura mesentérica (infiltração) -->
      <ellipse cx="195" cy="238" rx="28" ry="22" fill="#2a2a10" opacity="0.5" stroke="#5a5a20" stroke-width="1.5" stroke-dasharray="4,3"/>
      <!-- Infos overlay -->
      <text x="16" y="22" fill="#888" font-size="9" font-weight="bold" font-family="monospace">TC ABDOME</text>
      <text x="16" y="36" fill="#666" font-size="8" font-family="monospace">W:400 L:40</text>
      <text x="390" y="22" text-anchor="end" fill="#888" font-size="9" font-weight="bold" font-family="monospace">AXIAL</text>
    </svg>`;
  }

  function getImagingSVG(imageType) {
    if (imageType === "xray-abdomen") return buildXRayAbdomenSVG();
    if (imageType === "ct-axial") return buildCTAxialSVG();
    return buildColonoscopyMucosaSVG();
  }

  function renderHotspotPanel(hotspot) {
    if (!hotspot) {
      return `
        <div class="imaging-tree__empty">
          <div class="imaging-tree__empty-icon">🔍</div>
          <p>Clique em um marcador numerado na imagem para ativar o raciocínio diagnóstico sobre aquele achado.</p>
        </div>
      `;
    }
    const typeIcon = { confirms: "✓", against: "✕", neutral: "→" };
    const pathway = (hotspot.pathway || []).map(p => `
      <div class="imaging-pathway__item imaging-pathway__item--${p.type || "neutral"}">
        <p class="imaging-pathway__label">${typeIcon[p.type] || "→"} ${p.label || "Interpretação"}</p>
        <p class="imaging-pathway__disease">${p.disease}</p>
        <p class="imaging-pathway__evidence">${p.evidence}</p>
        ${p.action ? `<p class="imaging-pathway__action">📋 ${p.action}</p>` : ""}
      </div>
    `).join("");

    return `
      <div class="imaging-finding">
        <div class="imaging-finding__head">
          <div class="imaging-finding__badge">${hotspot.label}</div>
          <div>
            <h4 class="imaging-finding__name">${hotspot.title}</h4>
            ${hotspot.modality ? `<p class="imaging-finding__modality">${hotspot.modality}</p>` : ""}
          </div>
        </div>
        <p class="imaging-finding__desc">${hotspot.finding}</p>
        ${hotspot.interpretation ? `<p class="imaging-finding__interp"><strong>Interpretação:</strong> ${hotspot.interpretation}</p>` : ""}
        ${pathway ? `<div class="imaging-pathway">${pathway}</div>` : ""}
      </div>
    `;
  }

  function renderImagingTree(section) {
    const treeId = section.id || ("tree_" + Math.random().toString(36).slice(2, 8));
    imagingCache.set(treeId, section);

    const hotspots = (section.hotspots || []).map(h => `
      <button
        class="imaging-hotspot"
        style="left:${h.x}%;top:${h.y}%"
        data-tree-id="${treeId}"
        data-hotspot-id="${h.id}"
        data-imaging-hotspot
        type="button"
        aria-label="${h.title}"
        title="${h.title}"
      >${h.label}</button>
    `).join("");

    const navBtns = (section.hotspots || []).map(h => `
      <button
        class="imaging-tree__nav-btn"
        data-tree-id="${treeId}"
        data-hotspot-id="${h.id}"
        data-hotspot-btn
        type="button"
      >
        <span class="nav-num">${h.label}</span>
        ${h.shortTitle || h.title}
      </button>
    `).join("");

    return `
      <article class="section-card animate-ready">
        <div class="section-card__header">
          <span class="section-card__icon">${section.icon || "🔬"}</span>
          <div class="section-card__title">
            <h3>${section.title}</h3>
            ${section.subtitle ? `<p>${section.subtitle}</p>` : ""}
          </div>
        </div>
        <div class="section-card__body">
          <div class="imaging-tree">
            <div class="imaging-tree__layout">
              <div class="imaging-tree__viewer">
                <div class="imaging-tree__svg-wrap">${getImagingSVG(section.imageType || "colonoscopy")}</div>
                ${hotspots}
                ${section.imageCaption ? `<div class="imaging-tree__caption">${section.imageCaption}</div>` : ""}
              </div>
              <div class="imaging-tree__panel" id="imaging-panel-${treeId}">
                ${renderHotspotPanel(null)}
              </div>
            </div>
            ${navBtns ? `<div class="imaging-tree__nav">${navBtns}</div>` : ""}
          </div>
        </div>
      </article>
    `;
  }

  function wireImagingTrees() {
    document.querySelectorAll("[data-imaging-hotspot]").forEach(btn => {
      btn.addEventListener("click", () => {
        const treeId = btn.getAttribute("data-tree-id");
        const hotspotId = btn.getAttribute("data-hotspot-id");

        document.querySelectorAll(`[data-tree-id="${treeId}"]`).forEach(el => el.classList.remove("is-active"));
        btn.classList.add("is-active");
        const navBtn = document.querySelector(`[data-hotspot-btn][data-tree-id="${treeId}"][data-hotspot-id="${hotspotId}"]`);
        if (navBtn) navBtn.classList.add("is-active");

        const panel = document.getElementById("imaging-panel-" + treeId);
        const sectionData = imagingCache.get(treeId);
        if (panel && sectionData) {
          const hotspot = (sectionData.hotspots || []).find(h => h.id === hotspotId);
          panel.innerHTML = renderHotspotPanel(hotspot || null);
        }
      });
    });

    document.querySelectorAll("[data-hotspot-btn]").forEach(btn => {
      btn.addEventListener("click", () => {
        const treeId = btn.getAttribute("data-tree-id");
        const hotspotId = btn.getAttribute("data-hotspot-id");
        const hotspotEl = document.querySelector(`[data-imaging-hotspot][data-tree-id="${treeId}"][data-hotspot-id="${hotspotId}"]`);
        if (hotspotEl) hotspotEl.click();
      });
    });
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
      case "mnemonic":
        return renderMnemonicCard(section);
      case "pitfalls":
        return renderPitfallsCard(section);
      case "decision-flow":
        return renderDecisionFlowCard(section);
      case "accordion":
        return renderAccordionCard(section);
      case "imaging-tree":
        return renderImagingTree(section);
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

    wireImagingTrees();
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
          <p>${dataBlock.heroIntro || pageMeta.subtitle}</p>
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
          <span class="section-kicker">${APP_CONFIG.dashboardHeroKicker || "Plataforma premium de sindrome diarreica"}</span>
          <h1>${APP_CONFIG.dashboardHeroTitle || "Diarreia, DII e parasitoses organizadas como plataforma real de revisao"}</h1>
          <p>${APP_CONFIG.dashboardHeroSubtitle || "Uma plataforma focada em diarreia aguda e cronica, ma absorcao, parasitoses intestinais e DII com revisao ativa."}</p>
          <div class="tag-row">
            <span class="tag tag--accent">${clinicalCount} paginas de conteudo</span>
            <span class="tag tag--success">${QUIZ_COUNT} questoes</span>
            <span class="tag tag--purple">${FLASHCARD_COUNT} flashcards</span>
          </div>
          <div class="button-row">
            <a class="btn btn--primary" href="${resolvePath(APP_CONFIG.dashboardPrimaryCtaHref || "paginas/classificacao-diarreia.html")}">${APP_CONFIG.dashboardPrimaryCtaLabel || "Comecar pela abordagem"}</a>
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
            APP_CONFIG.dashboardPriorityTitle || "O que esta trilha prioriza",
            APP_CONFIG.dashboardPrioritySubtitle || "Cada bloco foi desenhado para ligar suspeita, exame e conduta em uma sequencia unica.",
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
            <p>${APP_CONFIG.dashboardIntegrityText || "A trilha rende mais quando o estudo clinico, as comparacoes e a evocacao ativa sao usados em sequencia."}</p>
          </div>
          <div class="checklist-card animate-ready">
            <h3>Mapa rapido</h3>
            <div class="sidebar-progress__meta"><span>Principal</span><strong>${Math.max(groupById("principal").items.length - 1, 0)}</strong></div>
            <div class="sidebar-progress__meta"><span>Endometrio</span><strong>${groupById("endometrio").items.length}</strong></div>
            <div class="sidebar-progress__meta"><span>Colo</span><strong>${groupById("colo").items.length}</strong></div>
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
          <p>Estas tabelas concentram o que muda a alternativa correta em oncoginecologia: colo × endométrio, NIC × hiperplasia, rastreamento antigo × novo e os pontos que realmente desempatam a questão.</p>
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
            "Colo × endométrio: sintoma, rastreio e estadiamento são diferentes.",
            "NIC × hiperplasia: grau e atipia comandam cada uma.",
            "Rastreio antigo (1-2-3) × novo (DNA-HPV, 5 anos)."
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
            "Fluxogramas da trilha",
            "Cada trilho abaixo foi redesenhado para parecer raciocinio clinico de decisao, e nao checklist empilhado.",
            `
              <div class="card-grid">
                ${FLOW_CARDS.map((flow) => `
                  <div class="flow-card animate-ready">
                    <h3>${flow.title}</h3>
                    <div class="flow-steps">
                      ${flow.steps.map((step, index) => `
                        <div class="flow-step">
                          <span class="flow-step__index">${index + 1}</span>
                          <p>${step}</p>
                        </div>
                      `).join('<div class="flow-step__connector">↓</div>')}
                    </div>
                    <p>${flow.note}</p>
                  </div>
                `).join("")}
              </div>
            `
          )}
        </div>
        <aside class="rail-column">${renderChecklistRail({
          highlights: [
            "Sangramento ginecológico abre por idade, padrão e origem.",
            "16/18 não esperam lâmina; HPV negativo = 5 anos.",
            "Paramétrio (IIB) fecha a porta da cirurgia no colo."
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
          <h1>Mnemonicos que encurtam a prova sem desmontar a fisiologia</h1>
          <p>O objetivo aqui não é decorar frase solta. É deixar cada pista colada ao mecanismo: atipia manda na hiperplasia, 16/18 não espera lâmina, 3-5-2-4 organiza o estádio I e Schiller positivo é iodo negativo.</p>
          <div class="tag-row">
            <span class="tag tag--purple">Blocos por tema</span>
            <span class="tag tag--accent">Endométrio, rastreio, colposcopia e câncer invasivo</span>
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
            "Estrogênio estimula; progesterona protege.",
            "1-2-3 (antigo) × 5 anos (novo).",
            "3-5-2-4 resume o estádio I do colo."
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
          <p>Este bloco neutraliza os erros que a banca adora cobrar em oncoginecologia: sangramento pós-menopausa tratado como atrofia, Papanicolau em lesão visível, coteste universal, Schiller invertido, paramétrio ignorado. Cada card traz erro comum, por que está errado e como evitar.</p>
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
            "Armadilhas da trilha",
            "Cada card traz o erro e a forma certa de escapar.",
            `
              <div class="tip-grid">
                ${PITFALLS.map((trap) => `
                  <div class="tip-card tip-card--trap animate-ready">
                    <div class="tip-card__icon">⚠</div>
                    <div>
                      <h3>${trap.title}</h3>
                      <p><strong>Por que esta errado:</strong> ${trap.body}</p>
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
            "Endométrio fino em alto risco com sangramento recorrente não tranquiliza.",
            "Lesão visível no colo não é rastreio.",
            "Paramétrio comprometido = fora da cirurgia."
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
          <h1>Revisao rapida para amarrar a trilha inteira</h1>
          <p>Esta pagina condensa os contrastes e checkpoints mais cobrados sem perder a logica clinica. E uma pagina de fechamento, nao substituto do estudo das paginas clinicas.</p>
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
              <p>Volte aqui depois de errar e corrigir para amarrar a trilha inteira.</p>
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
            "Se as frases abaixo sairem sem hesitacao, o eixo inteiro esta bem consolidado.",
            renderBullets([
              "Sangramento ginecológico abre por idade, padrão e origem antes de qualquer exame.",
              "Sangramento pós-menopausa exige especular + USG TV; 4 mm sem TH e 8 mm com TH puxam amostra.",
              "Estrogênio estimula; progesterona protege — resume risco, proteção e tratamento conservador.",
              "Atipia manda na hiperplasia: sem atipia = progesterona; com atipia = histerectomia.",
              "Endométrio é cirúrgico; colo é clínico-radiológico. 3-5-2-4 organiza o estádio I.",
              "Rastreio novo: 16/18 vai direto para colposcopia; outros oncogênicos pedem citologia reflexa.",
              "Paramétrio comprometido (IIB) fecha a porta da cirurgia no câncer de colo."
            ])
          )}
        </div>
        <aside class="rail-column">${renderChecklistRail({
          highlights: [
            "Se travou no sangramento, volte para idade + padrão + origem.",
            "Se travou na hiperplasia, centralize em atipia.",
            "Se travou no colo, revise 3-5-2-4 e o ponto da virada em IIB."
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
          <span class="section-kicker">Casos que integram a trilha</span>
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
            "Casos integradores da trilha",
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
            "Como usar os casos sem perder densidade",
            "O melhor uso desta pagina e depois do estudo-base, para ver se a sequencia de decisao ficou realmente automatica.",
            renderBullets([
              "Leia o caso e tente responder antes de abrir a virada no card.",
              "Se travar na investigação endometrial, volte para os cortes 4 mm / 8 mm e o papel da histeroscopia.",
              "Se travar no colo, revise o algoritmo do rastreio novo (16/18 × outros oncogênicos) e a virada cirúrgica em IIB."
            ])
          )}
        </div>
        <aside class="rail-column">${renderChecklistRail({
          highlights: [
            "Caso bom mistura sindrome e detalhe de alta especificidade.",
            "A banca adora mudar o exame e nao a doenca.",
            "Se a historia e tipica, respeite a narrativa."
          ],
          related: ["sangramento-ginecologico", "rastreamento-novo-dna-hpv", "revisao-rapida"]
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
          <p>As questões abaixo simulam o tipo de decisão que mais cai em oncoginecologia: sangramento pós-menopausa, fatores de risco, hiperplasia, rastreamento do colo (antigo × novo), colposcopia, NIC, estadiamento 3-5-2-4 e tratamento cirúrgico × quimiorradio.</p>
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
          <p>Volte ao dashboard e reabra a trilha a partir do painel principal.</p>
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
    initTopbarAutohide();
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
  initTopbarAutohide();
}());
