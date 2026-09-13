const PLATFORM_DATA = {
    gist: {
        title: "GIST Gástrico",
        subtitle: "Cirurgia Oncológica • Mesênquima",
        pages: [
            {
                title: "O Marcapasso que deu errado",
                ancoraSup: "Onde a Peristalse se perde: A Origem Mesenquimal",
                content: "O GIST é um <strong>Sarcoma</strong> de linhagem mesenquimal. Sua origem nasce nas <strong>Células Intersticiais de Cajal</strong>, o marcapasso endógeno que regula a peristalse gástrica. Diferente do adenocarcinoma, que 'fura' a parede de dentro para fora, o GIST é <strong>intramural</strong>.",
                svgInfo: "Célula de Cajal: O alvo da mutação oncogênica.",
                imgMeta: "HISTOLOGIA REAL • PROLIFERAÇÃO FUSOCELULAR",
                caption: "Nota do Curador: Observe a arquitetura fusocelular típica, sem o padrão glandular do adenocarcinoma."
            },
            {
                title: "Geografia do GIST",
                ancoraSup: "A Prevalência Soberana",
                content: "Embora o nome diga 'Gastrointestinal', o estômago é o grande anfitrião em <strong>60% a 70%</strong> dos casos. Se encontrar uma massa submucosa no estômago, o GIST deve ser sua primeira hipótese.",
                svgInfo: "Estômago: O endereço favorito (60-70% dos casos).",
                imgMeta: "ENDOSCOPIA • MASSA SUBMUCOSA",
                caption: "Nota do Curador: Note o abaulamento da mucosa íntegra, característica de lesão intramural."
            },
            {
                title: "Marcadores de Identidade",
                ancoraSup: "O Protocolo CD117+",
                content: "O luxo do diagnóstico está na Imuno-histoquímica (IHQ). O marcador de ouro é o <strong>CD117 (c-Kit)</strong>, positivo em mais de 95% dos casos. CD34 e PDGF são marcadores secundários.",
                svgInfo: "CD117+: A assinatura de luxo que confirma a origem em Cajal.",
                imgMeta: "IMUNO-HISTOQUÍMICA • MARCAÇÃO POSITIVA",
                caption: "Nota do Curador: A coloração acastanhada intensa é o selo de confirmação do GIST."
            },
            {
                title: "O Enigma do Diagnóstico",
                ancoraSup: "EDA vs Biópsia",
                content: "No GIST, a regra de ouro é: <strong>NÃO BIOPSE</strong>. O risco de semeadura e a localização submucosa tornam a biópsia endoscópica arriscada e pouco sensível. O diagnóstico é visual e macroscópico.",
                svgInfo: "Aspecto Macroscópico: Lesão arredondada e brilhante.",
                imgMeta: "MACROSCOPIA • PEÇA CIRÚRGICA",
                caption: "Nota do Curador: A cápsula do tumor deve ser preservada para evitar recidiva local."
            },
            {
                title: "A Profundidade do T",
                ancoraSup: "Ecoendoscopia e Invasão",
                content: "A <strong>Ultrassonografia Endoscópica</strong> é o exame mais sensível para avaliar a invasão intramural. Ela revela exatamente de qual camada a lesão emerge e qual sua extensão real.",
                svgInfo: "Camada Muscular: A 4ª camada é o ponto de origem clássico.",
                imgMeta: "ECOENDOSCOPIA • AVALIAÇÃO DE T",
                caption: "Nota do Curador: Lesão hipoecoica originada na muscular própria."
            },
            {
                title: "Cirurgia de Precisão",
                ancoraSup: "O Veto à Linfadenectomia",
                content: "O tratamento é a ressecção com margem livre (0.5 a 1.0 cm). <strong>NÃO se faz linfadenectomia de rotina</strong>, pois a disseminação é predominantemente hematogênica.",
                svgInfo: "Margem de Segurança: R0 é o objetivo absoluto.",
                imgMeta: "ALGORITMO • REGRA DOS 2CM",
                caption: "Nota do Curador: Lesões > 2cm exigem cirurgia imediata."
            },
            {
                title: "O Protocolo Glivec",
                ancoraSup: "Imatinib e Critérios de Risco",
                content: "A revolução atende pelo nome de <strong>Imatinib (Glivec)</strong>. Indicado para doença metastática, risco de recorrência (tamanho e mitoses) ou como neoadjuvância em lesões irressecáveis.",
                svgInfo: "Inibidor de Tirosina Quinase: O ataque direto à mutação c-Kit.",
                imgMeta: "TABELA DE RISCO • ÍNDICE MITÓTICO",
                caption: "Nota do Curador: O número de mitoses define a agressividade biológica do tumor."
            }
        ]
    },
    apendice: {
        title: "Tumores de Apêndice",
        subtitle: "Cirurgia Oncológica • A Trindade",
        pages: [
            {
                title: "O Tríptico do Apêndice",
                ancoraSup: "Além da Apendicite: Adeno, Muco e Neuro",
                content: "O apêndice cecal é o palco de uma trindade tumoral: Tumor Neuroendócrino, Adenocarcinoma e Neoplasia Mucinosa. O <strong>Carcinoide</strong> vence, aparecendo em quase 1% das peças.",
                svgInfo: "A Trindade: Três linhagens que exigem condutas distintas.",
                imgMeta: "MACROSCOPIA • APÊNDICE",
                caption: "Nota do Curador: O diagnóstico costuma ser incidental no pós-operatório."
            },
            {
                title: "O Fantasma do Carcinoide",
                ancoraSup: "Por que o fígado nos protege?",
                content: "O Carcinoide só causa a <strong>Síndrome Carcinoide</strong> quando há Metástase Hepática. O fígado inativa as substâncias vasoativas produzidas pelo tumor restrito ao apêndice.",
                svgInfo: "Circulação Porta: O escudo que neutraliza os metabólitos.",
                imgMeta: "FOTOGRAFIA • FLUSH CUTÂNEO",
                caption: "Nota do Curador: O flush ocorre quando os metabólitos atingem a circulação sistêmica."
            },
            {
                title: "A Emboscada do Adeno",
                ancoraSup: "O Apêndice é Cólon",
                content: "O Adenocarcinoma de apêndice deve ser tratado como <strong>Câncer Colorretal</strong>. Exige Hemicolectomia Direita Oncológica com ressecção de no mínimo 12 linfonodos.",
                svgInfo: "Hemicolectomia Direita: O padrão para o Adenocarcinoma.",
                imgMeta: "HISTOLOGIA • PADRÃO GLANDULAR",
                caption: "Nota do Curador: Diferente do GIST, a disseminação aqui é linfática."
            },
            {
                title: "A Bomba de Mucina",
                ancoraSup: "Mucocele e Pseudomixoma",
                content: "Se a Mucocele estourar, ocorre a semeadura de <strong>Pseudomixoma Peritoneal</strong>. O tratamento exige Citorredução agressiva e <strong>HIPEC</strong> (Quimioterapia Hipertérmica).",
                svgInfo: "Bomba Relógio: O perigo da perfuração iatrogênica.",
                imgMeta: "INTRAOP • GELATINA PERITONEAL",
                caption: "Nota do Curador: O peritônio preenchido por mucina exige lavagem exaustiva."
            },
            {
                title: "O Xadrez Intraoperatório",
                ancoraSup: "O Limiar dos 2 Centímetros",
                content: "Decisão no campo: Se o tumor for <strong>> 2cm</strong>, envolver a <strong>base</strong> ou invadir o <strong>mesoapêndice</strong>, a conduta muda para Hemicolectomia Direita imediata.",
                svgInfo: "Regra dos 2cm: O divisor entre apendicectomia e colectomia.",
                imgMeta: "FLUXOGRAMA • CONDUTA INTRAOP",
                caption: "Nota do Curador: O mesoapêndice é o caminho da disseminação."
            },
            {
                title: "O Veredito do Laudo",
                ancoraSup: "A Obrigação do Retorno",
                content: "Todo apêndice deve ir para o histopatológico. A conduta pós-operatória depende do grau de agressividade e das margens descritas no laudo.",
                svgInfo: "Checklist de Laudo: Tamanho, Margens e Mitoses.",
                imgMeta: "LAUDO • EXEMPLE DE RESULTADO",
                caption: "Nota do Curador: Nunca dê alta definitiva sem o resultado da patologia."
            },
            {
                title: "Combate de Elite",
                ancoraSup: "Desafio SUS-SP / ENARE",
                content: "Mulher, 35 anos, Carcinoide de 1,5 cm com invasão linfovascular. <strong>Qual a conduta?</strong> A resposta certa é Hemicolectomia, devido ao critério de risco.",
                svgInfo: "Feedback: A invasão linfovascular anula o critério de tamanho pequeno.",
                imgMeta: "QUESTÃO • RESOLUÇÃO Densa",
                caption: "Nota do Curador: O 'Feedback que Ensina' foca no porquê das erradas."
            }
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const hub = document.getElementById('hub-container');
    const platform = document.getElementById('lesson-platform');
    const backBtn = document.getElementById('back-to-hub');
    const lessonCards = document.querySelectorAll('.lesson-card');
    
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    let currentLesson = null;
    let currentPage = 0;

    // --- HUB NAVIGATION ---
    lessonCards.forEach(card => {
        card.addEventListener('click', () => {
            const lessonKey = card.getAttribute('data-lesson');
            startLesson(lessonKey);
        });
    });

    backBtn.addEventListener('click', () => {
        platform.classList.add('hidden');
        hub.classList.remove('hidden');
        currentLesson = null;
    });

    function startLesson(key) {
        currentLesson = PLATFORM_DATA[key];
        currentPage = 0;
        
        hub.classList.add('hidden');
        platform.classList.remove('hidden');
        
        loadPage();
    }

    // --- PAGE LOADING ENGINE ---
    function loadPage() {
        const page = currentLesson.pages[currentPage];
        
        document.getElementById('platform-title').innerText = currentLesson.title;
        document.getElementById('platform-subtitle').innerText = currentLesson.subtitle;
        
        const main = document.getElementById('platform-content');
        main.innerHTML = `
            <section class="page-container active">
                <div class="ancora-sup">${page.ancoraSup}</div>
                <div class="content-card glass">
                    <h2 class="highlight">${page.title}</h2>
                    <p>${page.content}</p>
                    
                    <div class="visual-container">
                        <div class="svg-placeholder living-structure">
                            <div class="hotspot" style="top: 50%; left: 50%;" data-info="${page.svgInfo}"></div>
                            <p class="svg-label">Estrutura Viva (Interativo)</p>
                        </div>
                        <div class="info-panel" id="hotspot-display">Clique na estrutura para explorar.</div>
                    </div>

                    <div class="img-real glass">
                        <div class="img-meta">${page.imgMeta}</div>
                        <div class="img-placeholder"></div>
                        <p class="caption">${page.caption}</p>
                    </div>
                </div>
                <div class="ancora-inf">Página ${currentPage + 1} de ${currentLesson.pages.length}</div>
            </section>
        `;

        setupHotspots();
        updateProgress();
        updateNavButtons();
    }

    function setupHotspots() {
        const hotspots = document.querySelectorAll('.hotspot');
        const display = document.getElementById('hotspot-display');

        hotspots.forEach(spot => {
            spot.addEventListener('click', () => {
                const info = spot.getAttribute('data-info');
                display.style.opacity = 0;
                setTimeout(() => {
                    display.innerText = info;
                    display.style.opacity = 1;
                    display.style.borderColor = '#d4af37';
                }, 200);
            });
        });
    }

    function updateProgress() {
        const fill = document.getElementById('progress-fill');
        const total = currentLesson.pages.length;
        const percent = ((currentPage + 1) / total) * 100;
        fill.style.width = `${percent}%`;
    }

    function updateNavButtons() {
        prevBtn.disabled = currentPage === 0;
        if (currentPage === currentLesson.pages.length - 1) {
            nextBtn.innerText = "Finalizar Módulo";
        } else {
            nextBtn.innerText = "Próxima";
        }
    }

    // --- NAVIGATION EVENTS ---
    nextBtn.addEventListener('click', () => {
        if (currentPage < currentLesson.pages.length - 1) {
            currentPage++;
            loadPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            platform.classList.add('hidden');
            hub.classList.remove('hidden');
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            loadPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
});
