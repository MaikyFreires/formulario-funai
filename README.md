# Formulário FUNAI para GitHub Pages

Projeto estático com HTML, CSS e JavaScript puro para coleta de solicitações e reivindicações.

## Arquivos

- `index.html`: estrutura do formulário em etapas.
- `styles.css`: layout responsivo e visual do formulário.
- `script.js`: validações, condicionais, verificação de e-mail, rascunho e envio para Power Automate.

## Configuração

1. Abra `script.js`.
2. Preencha a constante `VERIFY_ACCESS_URL` com a URL HTTP POST do fluxo que verifica se o e-mail está autorizado.
3. Preencha a constante `POWER_AUTOMATE_URL` com a URL HTTP POST do fluxo que recebe o formulário.
4. Ajuste `SECRET_TOKEN`, se quiser trocar o token secreto enviado dentro do payload.
5. Publique e acesse a URL gerada pelo GitHub Pages:

```text
https://seu-usuario.github.io/seu-repositorio/
```

O formulário principal só aparece após a autorização do e-mail pelo Power Automate.

## Payload

O envio usa `fetch` com método `POST`, cabeçalho `Content-Type: application/json` e corpo JSON contendo:

- `tokenSecreto`
- `origem`
- `enviadoEm`
- `consultor`
- `reivindicacao`
- `resumoProcesso`
- `statusProcesso`
- `caracterizacaoArea`
- `ocupacaoIndigena`

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. No terminal, conecte este projeto ao repositório remoto:

```bash
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
git branch -M main
git push -u origin main
```

3. No GitHub, entre em `Settings` > `Pages`.
4. Em `Build and deployment`, selecione `Deploy from a branch`.
5. Escolha a branch `main` e a pasta `/root`.
6. Salve. O GitHub vai gerar a URL pública do formulário.

## Teste local

Como é um site estático, você pode abrir `index.html` no navegador. Para testar o bloqueio, use a URL com o parâmetro:

```text
http://127.0.0.1:8000/
```

Use servidor local quando precisar carregar o arquivo `municipios-estados.csv`.
