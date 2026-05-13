# Formulario FUNAI

Aplicacao estatica para preenchimento de formulario em etapas, com foco em coleta estruturada de dados de reivindicacoes.

## Estrutura

- `index.html`: ponto de entrada da aplicacao.
- `html/`: telas HTML carregadas pelo index, incluindo acesso, dashboard e formulario.
- `css/styles.css`: estilos visuais e responsividade.
- `js/script.js`: regras de interface, validacoes, rascunho local e envio.
- `js/config.example.js`: modelo de configuracao local.
- `data/municipios-estados.csv`: base de municipios e estados usada nos campos de localizacao.
- `assets/`: imagens e arquivos visuais usados pela interface.

## Uso

O formulario possui uma tela inicial de acesso por e-mail e, apos a validacao, libera o preenchimento das etapas. Durante o preenchimento, e possivel salvar rascunho no navegador e continuar depois no mesmo dispositivo.

## Publicacao

Este projeto pode ser publicado como site estatico, por exemplo em GitHub Pages, sem etapa de build.

Arquivos locais de configuracao nao devem ser versionados.
