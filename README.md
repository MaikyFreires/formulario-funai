# Formulario FUNAI

Aplicacao estatica para preenchimento, recuperacao e envio de formularios de resumo de processos de reivindicacao.

## Fluxo

- Acesso inicial por e-mail autorizado.
- Dashboard do consultor com Novo formulario, Meus rascunhos e Enviados.
- Salvamento de rascunho e envio final via Power Automate/SharePoint.
- Recuperacao de rascunhos pelo `formularioId`.
- Visualizacao de enviados com opcao de salvar em PDF.

## Estrutura

- `index.html`: ponto de entrada da aplicacao.
- `html/`: telas carregadas pelo index.
  - `acesso.html`: tela de login por e-mail.
  - `dashboard.html`: painel do consultor.
  - `formulario.html`: formulario em etapas.
- `css/styles.css`: arquivo principal de estilos, com imports.
- `css/partials/`: estilos separados por responsabilidade.
  - `00-base.css`: variaveis, base visual, fundo e rodape.
  - `10-access-dashboard.css`: acesso, dashboard, listas e confirmacao.
  - `20-form-layout.css`: cabecalho do formulario, progresso, etapas e grids.
  - `30-controls.css`: campos, inputs, autocomplete, chips e processos.
  - `40-tables.css`: tabelas de documentos e coordenadas.
  - `50-form-sections.css`: secoes especificas do formulario.
  - `60-components-actions.css`: condicionais, mensagens, erros e botoes.
  - `70-responsive.css`: responsividade.
  - `80-print.css`: impressao/PDF.
- `js/script.js`: regras de interface, validacoes, dashboard, rascunhos e envio.
- `js/config.example.js`: modelo publico de configuracao.
- `data/`: arquivos CSV usados nos campos.
- `assets/`: imagens usadas na interface.

## Configuracao

Copie `js/config.example.js` para `js/config.js` e preencha as URLs dos fluxos do Power Automate no ambiente local. O arquivo real `js/config.js` nao deve ser enviado ao GitHub.

## Publicacao

O projeto pode ser publicado como site estatico, por exemplo no GitHub Pages. Nao ha etapa de build.

## Observacoes

- Use um servidor local para testar CSVs e carregamento de telas parciais.
- Depois de mudancas em CSS ou JS, atualize o cache bust em `index.html` e em `APP_VERSION` no `js/script.js`.
- Nao versione arquivos locais com URLs reais, segredos ou anotacoes internas.
