# Neonatologia Aula 1

Mini plataforma local gerada em modo `ONE_LECTURE_AUTO_RUN` a partir da transcrição:

`/Users/bauervieiracesarfilhovieira/Documents/Referências de plataformas /neonatologia/transcricoes/aula1-classificacao-rn-sifilis-congenita.txt`

## Como abrir

```bash
cd "/Users/bauervieiracesarfilhovieira/Documents/WORKING PROJECT/neonatologia-aula1-sifilis-congenita"
python3 -m http.server 8091
```

Depois acesse `http://localhost:8091`.

## Estrutura

- `index.html`: interface principal da aula.
- `css/style.css`: design responsivo e acessível.
- `js/app.js`: calculadoras, quiz, menu, progresso e painel da transcrição.
- `data/transcricao.txt`: fonte integral preservada.
- `assets/illustrations/hero-generated.png`: capa raster gerada para a plataforma.
- `assets/illustrations/*.svg`: infográficos autorais gerados localmente para a aula.
- `sw.js`: cache local simples para PWA.
- `offline.html`: fallback offline.

## Conteúdo coberto

- Classificação por idade gestacional.
- Classificação por peso ao nascer.
- Cruzamento peso × idade gestacional.
- Vias de infecção neonatal.
- Conceitos gerais de infecção congênita.
- Sífilis congênita: transmissão, clínica precoce/tardia, VDRL, investigação, tratamento, seguimento.
- Caso Florinda Rosa e João Eucalipto.

## Interações prontas

- Classificador de idade gestacional e peso.
- Comparador de VDRL mãe × RN por diluições.
- Leitor de líquor.
- Decisor terapêutico completo.
- Flashcards reversíveis.
- Quiz com feedback imediato.
- Painel lateral com busca na transcrição integral.
- Progresso local de estudo.

## QA local realizado

- Servidor local em `http://localhost:8091`.
- Validação de carregamento por `curl`.
- Validação sintática de `js/app.js` com `node --check`.
- Validação JSON do manifesto.
- Validação XML dos SVGs.
- Captura visual headless no Chrome:
  - `qa-desktop.png`
  - `qa-mobile.png`
