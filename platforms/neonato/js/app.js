const quizItems = [
  {
    question: "RN com 36 semanas e 4 dias deve ser classificado quanto à idade gestacional como:",
    options: ["Pré-termo tardio", "Termo inicial", "Pós-termo", "Pré-termo extremo"],
    answer: 0,
    rationale: "A aula define pré-termo tardio como 34 semanas até 36 semanas e 6 dias."
  },
  {
    question: "Qual faixa define baixo peso ao nascer na aula?",
    options: ["Menor que 2.500 g até 1.500 g", "Menor que 1.500 g até 1.000 g", "Menor que 1.000 g", "Acima do P90"],
    answer: 0,
    rationale: "Muito baixo peso começa abaixo de 1.500 g; extremo baixo peso, abaixo de 1.000 g."
  },
  {
    question: "Em recém-nascidos, a normalidade no gráfico peso × idade gestacional fica entre:",
    options: ["P10 e P90", "P3 e P97", "P5 e P95", "P25 e P75"],
    answer: 0,
    rationale: "A aula avisa para não aplicar P3/P97 da pediatria geral ao RN."
  },
  {
    question: "Qual achado de líquor já torna o tratamento restrito à penicilina cristalina?",
    options: ["Proteína maior que 150", "VDRL periférico 1:2", "Peso menor que 2.500 g", "Mãe com parceiro não tratado"],
    answer: 0,
    rationale: "Líquor alterado: VDRL positivo, celularidade > 25 ou proteína > 150."
  },
  {
    question: "A primeira etapa do fluxograma de sífilis congênita é avaliar:",
    options: ["Se o tratamento materno foi adequado", "Se o RN tem dente de Hutchinson", "Se o parceiro foi tratado", "Se há FTA-ABS positivo"],
    answer: 0,
    rationale: "A aula insiste que a análise começa pelo tratamento da gestante."
  }
];

const flashcardItems = [
  {
    front: "Capurro × New Ballard",
    back: "Capurro é mais simples, mas perde desempenho em prematuros muito pequenos. New Ballard ajuda mais em prematuridade importante."
  },
  {
    front: "IgM positiva no RN",
    back: "IgM é grande e não atravessa placenta. Se o bebê tem IgM, a produção é dele, sugerindo infecção do próprio RN."
  },
  {
    front: "Tratamento materno adequado",
    back: "Precisa cumprir três critérios: benzatina, dose/intervalo adequados ao estágio e primeira dose pelo menos 30 dias antes do parto."
  },
  {
    front: "Líquor alterado",
    back: "VDRL positivo no LCR, celularidade > 25 ou proteína > 150. Qualquer um já muda a conduta para cristalina EV."
  },
  {
    front: "Pseudoparalisia de Parrot",
    back: "Não é paralisia verdadeira. O bebê deixa de mexer por dor intensa da osteocondrite."
  },
  {
    front: "Seguimento com VDRL",
    back: "Exposto não tratado deve negativar até 6 meses. Sífilis tratada deve negativar até 18 meses."
  }
];

const state = {
  completed: new Set(),
  transcript: "",
  flippedCards: new Set()
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function updateProgress(id) {
  if (id) state.completed.add(id);
  const sections = ["classificacao", "infeccoes", "sifilis", "fluxo", "caso", "fixacao"];
  const value = Math.round((state.completed.size / sections.length) * 100);
  $("#progress-value").textContent = `${value}%`;
  $("#progress-bar").style.width = `${value}%`;
}

function classifyGestationalAge(weeks, days) {
  const totalDays = weeks * 7 + days;
  if (weeks >= 42) return "pós-termo";
  if (weeks >= 37) return "termo";
  if (weeks < 28) return "pré-termo extremo";
  if (weeks >= 34) return "pré-termo tardio";
  return "pré-termo";
}

function classifyWeight(weight) {
  if (weight < 1000) return "extremo baixo peso";
  if (weight < 1500) return "muito baixo peso";
  if (weight < 2500) return "baixo peso";
  return "peso acima do ponto de corte de baixo peso";
}

function estimatePig(weeks, weight) {
  if (weeks >= 37 && weight < 2000) {
    return "PIG provável pela regra prática da aula: com 37 semanas ou mais, menos de 2.000 g fica abaixo do P10.";
  }
  if (weeks === 36 && weight === 1900) {
    return "No caso da aula, 36s4d e 1.900 g cruzam abaixo do P10: PIG.";
  }
  return "Para PIG/AIG/GIG definitivo, use o gráfico de peso por idade gestacional com curvas P10-P90.";
}

function dilutionSteps(value) {
  if (value === 0) return -Infinity;
  return Math.log2(value / 2);
}

function renderQuiz() {
  const quiz = $("#quiz");
  quiz.innerHTML = "";

  quizItems.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "quiz-card";
    card.innerHTML = `<h3>${index + 1}. ${item.question}</h3><div class="quiz-options"></div><p hidden></p>`;

    const options = card.querySelector(".quiz-options");
    const feedback = card.querySelector("p");

    item.options.forEach((option, optionIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option;
      button.addEventListener("click", () => {
        options.querySelectorAll("button").forEach((btn) => {
          btn.disabled = true;
        });
        button.classList.add(optionIndex === item.answer ? "correct" : "wrong");
        options.children[item.answer].classList.add("correct");
        feedback.hidden = false;
        feedback.textContent = item.rationale;
        updateProgress("fixacao");
      });
      options.append(button);
    });

    quiz.append(card);
  });
}

function renderFlashcards() {
  const container = $("#flashcards");
  container.innerHTML = "";

  flashcardItems.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = "flashcard";
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = `
      <span class="flashcard-inner">
        <strong>${item.front}</strong>
        <span>Clique para revelar.</span>
      </span>
    `;

    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-pressed") === "true";
      button.setAttribute("aria-pressed", String(!isOpen));
      button.querySelector(".flashcard-inner").innerHTML = !isOpen
        ? `<strong>${item.front}</strong><span>${item.back}</span>`
        : `<strong>${item.front}</strong><span>Clique para revelar.</span>`;
      state.flippedCards.add(index);
      if (state.flippedCards.size >= 3) updateProgress("fixacao");
    });

    container.append(button);
  });
}

async function loadTranscript() {
  const transcriptBox = $("#transcript-text");
  try {
    const response = await fetch("data/transcricao.txt");
    state.transcript = await response.text();
    transcriptBox.textContent = state.transcript;
  } catch (error) {
    transcriptBox.textContent = "Não foi possível carregar a transcrição via fetch. Abra por servidor local para usar este painel.";
  }
}

function setupTranscript() {
  const panel = $("#transcript-panel");
  const openButtons = $$("[data-action='toggle-transcript']");
  const closeButton = $(".close-transcript");
  const search = $("#transcript-search");

  const openPanel = () => {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    search.focus();
  };

  const closePanel = () => {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  };

  openButtons.forEach((button) => button.addEventListener("click", openPanel));
  closeButton.addEventListener("click", closePanel);

  search.addEventListener("input", () => {
    const term = search.value.trim().toLowerCase();
    if (!term) {
      $("#transcript-text").textContent = state.transcript;
      return;
    }

    const matches = state.transcript
      .split("\n")
      .filter((line) => line.toLowerCase().includes(term));

    $("#transcript-text").textContent = matches.length
      ? matches.join("\n")
      : "Nenhuma linha encontrada para esse termo.";
  });
}

function setupCalculators() {
  $("#rn-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const weeks = Number(form.get("weeks"));
    const days = Number(form.get("days"));
    const weight = Number(form.get("weight"));
    const age = classifyGestationalAge(weeks, days);
    const weightClass = classifyWeight(weight);
    const pig = estimatePig(weeks, weight);

    $("#rn-result").textContent = `${weeks}s${days}d: ${age}. ${weight} g: ${weightClass}. ${pig}`;
    updateProgress("classificacao");
  });

  $("#vdrl-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const mother = Number(form.get("mother"));
    const baby = Number(form.get("baby"));
    const difference = dilutionSteps(baby) - dilutionSteps(mother);
    const motherLabel = mother ? `1:${mother}` : "não reagente";
    const babyLabel = baby ? `1:${baby}` : "não reagente";

    $("#vdrl-result").textContent = difference >= 2
      ? `Mãe ${motherLabel}, RN ${babyLabel}: RN tem VDRL pelo menos duas diluições acima do materno. Pela aula, isso sustenta sífilis congênita.`
      : `Mãe ${motherLabel}, RN ${babyLabel}: não há aumento de duas diluições. Continue o fluxograma com exame físico e contexto materno.`;
    updateProgress("sifilis");
  });

  $("#lcr-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const cells = Number(form.get("cells"));
    const protein = Number(form.get("protein"));
    const vdrlLcr = form.get("vdrlLcr") === "on";
    const altered = vdrlLcr || cells > 25 || protein > 150;

    $("#lcr-result").textContent = altered
      ? "Líquor alterado. Pela aula, tratar apenas com penicilina cristalina endovenosa por 10 dias."
      : "Líquor sem critérios de alteração. Se houver outra alteração, cristalina EV ou procaína IM por 10 dias; se tudo normal, benzatina dose única.";
    updateProgress("fluxo");
  });

  $("#decision-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const adequateMother = form.get("benzathine") === "on" && form.get("stageDose") === "on" && form.get("thirtyDays") === "on";
    const lcrAltered = form.get("lcrAltered") === "on";
    const otherAlteration = form.get("physical") === "on" || form.get("otherTests") === "on";
    const vdrlTwoDilutions = form.get("vdrlTwoDilutions") === "on";

    let result = "";
    if (!adequateMother) {
      if (lcrAltered) {
        result = "Mãe inadequadamente tratada + líquor alterado: sífilis congênita com indicação de penicilina cristalina EV por 10 dias.";
      } else if (otherAlteration) {
        result = "Mãe inadequadamente tratada + outra alteração: sífilis congênita. Usar cristalina EV por 10 dias ou procaína IM por 10 dias.";
      } else {
        result = "Mãe inadequadamente tratada + RN todo normal: sífilis congênita por definição, com benzatina IM em dose única.";
      }
    } else if (vdrlTwoDilutions || (otherAlteration && form.get("otherTests") === "on")) {
      result = lcrAltered
        ? "Mãe adequadamente tratada, mas RN com critério de doença e líquor alterado: cristalina EV por 10 dias."
        : "Mãe adequadamente tratada, mas RN com critério de doença: notificar, investigar e tratar com cristalina EV ou procaína IM por 10 dias.";
    } else if (otherAlteration) {
      result = "Mãe adequada + RN sintomático sem VDRL preocupante: pela lógica da aula, procurar outra causa se VDRL for não reagente.";
    } else {
      result = "Mãe adequadamente tratada + RN assintomático sem VDRL preocupante: apenas acompanhamento clínico-laboratorial.";
    }

    $("#decision-result").textContent = result;
    updateProgress("fluxo");
  });
}

function setupNavigation() {
  const menu = $("#menu-aula");
  const toggle = $(".menu-toggle");

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const link = $(`.side-nav a[href="#${entry.target.id}"]`);
      $$(".side-nav a").forEach((navLink) => navLink.classList.remove("active"));
      if (link) link.classList.add("active");
      if (entry.target.classList.contains("lesson-section")) updateProgress(entry.target.id);
    });
  }, { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 });

  $$(".lesson-section").forEach((section) => observer.observe(section));
}

function setupReviewButton() {
  $("[data-action='start-review']").addEventListener("click", () => {
    $("#fixacao").scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("Revisão ativa aberta. Responda e leia a justificativa.");
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      showToast("Service worker não foi registrado nesta execução local.");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderFlashcards();
  renderQuiz();
  setupNavigation();
  setupCalculators();
  setupTranscript();
  setupReviewButton();
  loadTranscript();
  registerServiceWorker();
});
