# Campos do formulário FUNAI

Fonte analisada: `C:\Users\Adm\Downloads\formulario-146-recuperado-revisado-final.json`, `html/formulario.html` e `js/script.js`.

Observação: o JSON final guarda alguns campos duplicados/resumidos para compatibilidade. Para replicar em outro sistema, use principalmente os blocos estruturados e repetíveis indicados como lista.

## Campos de controle do formulário

| Campo JSON | Tipo | Observação |
|---|---|---|
| `formularioId` | texto | Identificador interno do formulário |
| `tokenSecreto` | texto | Token interno de integração |
| `statusFormulario` | texto | `Rascunho` ou `Enviado` |
| `atualizadoEm` | data/hora ISO | Última atualização |
| `enviadoEm` | data/hora ISO | Preenchido no envio final |
| `origem` | texto | Origem da aplicação |
| `etapaAtual` | número | Etapa atual do preenchimento |

## 1. Dados do consultor

| Rótulo no formulário | Campo JSON | Tipo / opções |
|---|---|---|
| Nome completo do(a) consultor(a) | `consultor.nome` | texto |
| E-mail do(a) consultor(a) | `consultor.email` | e-mail |
| Área de estudo | `consultor.areaEstudo` | seleção |

Opções de `consultor.areaEstudo`:
`Acre | Envira | Alto Purus`, `Alto Solimões 1`, `Alto Solimões 2`, `Médio Solimões 1 | Juruá`, `Médio Solimões 2`, `Médio Solimões 3`, `Manaus e Rio Negro`, `Roraima`, `Médio e Baixo Purus`, `Rondônia | Guaporé`, `Mato Grosso`, `Araguaia | Xingu | Oiapoque`, `Madeira (BR-319) | Foz do Madeira`, `Pará Central | Santarém`, `AMZ Oriental 1`, `AMZ Oriental 2`.

## 2. Reivindicação

| Rótulo no formulário | Campo JSON | Tipo / opções |
|---|---|---|
| ID | `reivindicacao.id` | texto numérico |
| Nome da reivindicação | `reivindicacao.nome` | texto |
| Etnias | `reivindicacao.etnias[]` | lista |
| Outra etnia | `reivindicacao.outrasEtnias[]` e `reivindicacao.outraEtnia` | lista e texto consolidado |
| Há outros nomes da reivindicação citados no processo? | `reivindicacao.outrosNomes` | `Sim`, `Não` |
| Outros nomes da reivindicação | `reivindicacao.outrosNomesTexto` | texto longo |
| Processos analisados | `reivindicacao.processosAnalisados[]` | lista repetível |
| Há roteiro de qualificação ou material semelhante? | `reivindicacao.temRoteiro` | `Sim`, `Não` |
| Data do roteiro | `reivindicacao.dataRoteiro` | data |
| Número SEI do documento de qualificação | `reivindicacao.numeroSeiQualificacao` | texto |
| Tipo da demanda | `reivindicacao.tipoDemanda[]` | múltipla escolha |
| Modalidade de constituição | `reivindicacao.modalidadeConstituicao` | seleção condicional |
| Há justificativa para a demanda por revisão de limites? | `reivindicacao.temJustificativaRevisao` | `Sim`, `Não`, `Sem informação` |
| Justificativa para revisão de limites | `reivindicacao.justificativaRevisao` | texto longo |
| Estado | `reivindicacao.estados[]` e `reivindicacao.estado` | lista e texto consolidado |
| Município | `reivindicacao.municipios[]` e `reivindicacao.municipio` | lista e texto consolidado |
| Coordenação Regional | `reivindicacao.coordenacaoRegional` | seleção |
| Há dados que informam ação de retomada do território? | `reivindicacao.temRetomada` | `Sim`, `Não` |
| Detalhes da retomada | `reivindicacao.detalhesRetomada` | texto |

Estrutura de `reivindicacao.processosAnalisados[]`:

| Campo JSON | Rótulo |
|---|---|
| `numeroSei` | Número SEI do processo analisado |
| `descricao` | Descrição do processo analisado |

Opções de `reivindicacao.tipoDemanda[]`: `Reserva Indígena`, `Identificação`, `Revisão de limites`.

Opções de `reivindicacao.modalidadeConstituicao`: `Arrecadação (Aquisição)`, `Destinação`, `Doação`, `Desapropriação`, `Sem informação`.

## 3. Resumo do processo

| Rótulo no formulário | Campo JSON | Tipo |
|---|---|---|
| Descrição da reivindicação | `resumoProcesso.descricao` | texto longo |
| Linha do tempo: documentos mais importantes | `resumoProcesso.documentos[]` | lista repetível |

Estrutura de `resumoProcesso.documentos[]`:

| Campo JSON | Rótulo |
|---|---|
| `dataDocumento` | Data |
| `tipoDocumento` | Tipo de documento |
| `paginasDocumento` | Página |
| `eventosAssuntos` | Assunto |
| `numeroSei` | Nº SEI |
| `numeroProcessoDocumento` | Nº do processo |

Campos resumidos do primeiro documento, mantidos no JSON: `resumoProcesso.dataDocumento`, `resumoProcesso.tipoDocumento`, `resumoProcesso.paginas`, `resumoProcesso.paginasDocumento`, `resumoProcesso.numeroSei`, `resumoProcesso.eventosAssuntos`, `resumoProcesso.numeroProcessoDocumento`.

## 4. Status do processo

| Rótulo no formulário | Campo JSON | Tipo / opções |
|---|---|---|
| Há ações judiciais contra a FUNAI? | `statusProcesso.estaJudicializado` | `Sim`, `Sem informação` |
| Motivação | `statusProcesso.tiposAcaoJudicial[]` | múltipla escolha |
| Qual outra motivação? | `statusProcesso.classificacaoJudicializacaoOutros` | texto |
| Motivação da judicialização | `statusProcesso.motivacaoJudicializacao` | texto consolidado |
| Ações judiciais detalhadas | `statusProcesso.acoesJudiciaisDetalhadas[]` | lista repetível |

Opções de `statusProcesso.tiposAcaoJudicial[]`: `Qualificação`, `Constituição de GT`, `Outros`.

Estrutura de `statusProcesso.acoesJudiciaisDetalhadas[]`:

| Campo JSON | Rótulo |
|---|---|
| `tipo` | Tipo/motivação da ação |
| `acpOutros` | Qual ação? / ACP ou outros |
| `numeroProcessoSei` | Número do processo SEI |
| `numeroAcao` | Número da ação |
| `data` | Data |
| `detalhesJudicializacao` | Detalhes sobre a judicialização |
| `temDecisaoJudicial` | Há decisão judicial? (`Sim`, `Não`, `Sem informação`) |
| `detalhesDecisao` | Detalhes sobre a decisão |

Campos resumidos/legados do primeiro item: `statusProcesso.classificacaoJudicializacao`, `statusProcesso.acoesJudiciais[]`, `statusProcesso.descricaoAcao`, `statusProcesso.parteAutoraAcao`, `statusProcesso.numeroProcessoSeiJudicial`, `statusProcesso.numeroAcaoJudicial`, `statusProcesso.dataAcaoJudicial`, `statusProcesso.detalhesJudicializacao`, `statusProcesso.temDecisao`, `statusProcesso.numeroDecisao`, `statusProcesso.dataDecisao`, `statusProcesso.sentenca`, `statusProcesso.detalhesDecisao`, `statusProcesso.numeroProcessoJudicial`.

## 5. Caracterização da área

| Rótulo no formulário | Campo JSON | Tipo / opções |
|---|---|---|
| Localização da demanda | `caracterizacaoArea.localizacaoDemanda` | texto longo |
| Há identificação de coordenadas geográficas? | `caracterizacaoArea.temCoordenadas` | `Sim`, `Não` |
| Coordenadas geográficas | `caracterizacaoArea.coordenadasDetalhadas[]` e `caracterizacaoArea.coordenadas[]` | lista repetível |
| Há mapa e material cartográfico nos processos? | `caracterizacaoArea.temMapaCartografico` | `Sim`, `Não` |
| Mapa e material cartográfico | `caracterizacaoArea.mapasCartograficos[]` | lista repetível |
| Bioma | `caracterizacaoArea.bioma[]` | múltipla escolha |
| Cita aldeias/comunidades? | `caracterizacaoArea.citaAldeiasComunidades` | `Sim`, `Não` |
| Quais aldeias/comunidades? | `caracterizacaoArea.aldeiasComunidadesLista[]` e `caracterizacaoArea.aldeiasComunidades` | lista e texto consolidado |
| Contexto urbano? | `caracterizacaoArea.contextoUrbano` | `Sim`, `Não`, `Sem informação` |
| Detalhes do contexto urbano | `caracterizacaoArea.detalhesContextoUrbano` | texto |
| Faixa de fronteira? | `caracterizacaoArea.faixaFronteira` | `Sim`, `Não`, `Sem informação` |
| Detalhes da faixa de fronteira | `caracterizacaoArea.detalhesFaixaFronteira` | texto |
| Há dados que informam ação de retomada do território? | `caracterizacaoArea.temRetomada` | `Sim`, `Não` |
| Detalhes da retomada | `caracterizacaoArea.detalhesRetomada` | texto |
| Sobreposições | `caracterizacaoArea.sobreposicoes` | `Sim`, `Não` |
| Tipos de sobreposição | `caracterizacaoArea.tiposSobreposicao[]` | múltipla escolha |

Estrutura de `caracterizacaoArea.coordenadasDetalhadas[]` e `caracterizacaoArea.coordenadas[]`:

| Campo JSON | Rótulo |
|---|---|
| `latitude` | Latitude |
| `longitude` | Longitude |
| `coordenadaSedeMunicipio` | Localizada na sede do município? |
| `comentarioCoordenada` | Comentário da coordenada |
| `tipoCoordenada` | Tipo de coordenada, campo legado/compatibilidade |
| `outroFormatoCoordenada` | Outro formato, campo legado/compatibilidade |
| `latitudeDirecao` | Direção da latitude, campo legado/compatibilidade |
| `longitudeDirecao` | Direção da longitude, campo legado/compatibilidade |

Campos resumidos da primeira coordenada: `caracterizacaoArea.latitude`, `caracterizacaoArea.longitude`, `caracterizacaoArea.coordenadaSedeMunicipio`, `caracterizacaoArea.comentarioCoordenada`, `caracterizacaoArea.tipoCoordenada`, `caracterizacaoArea.outroFormatoCoordenada`, `caracterizacaoArea.latitudeDirecao`, `caracterizacaoArea.longitudeDirecao`.

Estrutura de `caracterizacaoArea.mapasCartograficos[]`:

| Campo JSON | Rótulo |
|---|---|
| `numeroSei` | Nº do documento SEI |
| `pagina` | Página |
| `paginas` | Campo legado/compatibilidade |
| `paginasDocumento` | Campo legado/compatibilidade |

Opções de `caracterizacaoArea.bioma[]`: `Cerrado`, `Amazônia`, `Caatinga`, `Mata Atlântica`, `Pampa`, `Pantanal`.

Opções de `caracterizacaoArea.tiposSobreposicao[]` e respectivos campos de detalhe:

| Opção | Campo de detalhe |
|---|---|
| Unidade de Conservação Federal | `caracterizacaoArea.detalheUcFederal` |
| Unidade de Conservação Estadual | `caracterizacaoArea.detalheUcEstadual` |
| Unidade de Conservação Municipal | `caracterizacaoArea.detalheUcMunicipal` |
| Projeto de Assentamento (PA) | `caracterizacaoArea.detalheProjetoAssentamento` |
| Gleba Pública Federal | `caracterizacaoArea.detalheGlebaFederal` |
| Gleba Pública Estadual | `caracterizacaoArea.detalheGlebaEstadual` |
| Território Quilombola | `caracterizacaoArea.detalheTerritorioQuilombola` |
| Projeto de Assentamento Agroextrativista (PAE) | `caracterizacaoArea.detalheProjetoAssentamentoAgroextrativista` |
| Projeto de Desenvolvimento Sustentável (PDS) | `caracterizacaoArea.detalheProjetoDesenvolvimentoSustentavel` |
| Projeto de Assentamento Florestal (PAF) | `caracterizacaoArea.detalheProjetoAssentamentoFlorestal` |
| Outros | `caracterizacaoArea.detalheOutrasSobreposicoes` |

## 6. Situação da ocupação indígena

| Rótulo no formulário | Campo JSON | Tipo / opções |
|---|---|---|
| Indígenas estão na área reivindicada? | `ocupacaoIndigena.indigenasArea` | `Sim`, `Não`, `Sem informação` |
| Tempo de ocupação | `ocupacaoIndigena.tempoOcupacao` | texto |
| De quando é o dado da ocupação? | `ocupacaoIndigena.dataReferenciaOcupacao` | data |
| Critério de vulnerabilidade | `ocupacaoIndigena.vulnerabilidades[]` | múltipla escolha |
| Qual outro critério? | `ocupacaoIndigena.outroCriterioVulnerabilidade` | texto |
| Detalhes de vulnerabilidades | `ocupacaoIndigena.detalhesVulnerabilidades[]` | lista repetível |
| Há presença de outras comunidades tradicionais na área reivindicada? | `ocupacaoIndigena.comunidadesTradicionais` | `Sim`, `Não`, `Sem informação` |
| Povo ou comunidade tradicional | `ocupacaoIndigena.tiposComunidadeTradicional[]` | lista |
| Outros | `ocupacaoIndigena.descricaoComunidadeTradicional` | texto |
| Detalhes de comunidades tradicionais | `ocupacaoIndigena.detalhesComunidadesTradicionais[]` | lista repetível |
| Há conflito na área reivindicada? | `ocupacaoIndigena.conflitoInteretnico` | `Sim`, `Não`, `Sem informação` |
| De que tipo? | `ocupacaoIndigena.tiposConflito[]` | múltipla escolha |
| Detalhes de conflitos | `ocupacaoIndigena.detalhesConflitos[]` | lista repetível |
| Há indício de povos isolados? | `ocupacaoIndigena.povosIsolados` | `Sim`, `Não` |
| Detalhar indícios de povos isolados | `ocupacaoIndigena.detalhesPovosIsolados` | texto longo |
| Há ou houve ação de reintegração de posse sobre a comunidade? | `ocupacaoIndigena.reintegracaoPosse` | `Sim`, `Não`, `Sem informação` |
| Descrição da reintegração de posse | `ocupacaoIndigena.descricaoReintegracaoPosse` | texto longo |
| Há outras ações judiciais envolvendo a comunidade? | `ocupacaoIndigena.outrasAcoesJudiciaisComunidade` | `Sim`, `Não`, `Sem informação` |
| Descrição de outras ações judiciais | `ocupacaoIndigena.descricaoOutrasAcoesJudiciaisComunidade` | texto longo |
| Informações adicionais | `ocupacaoIndigena.informacoesAdicionais` | texto longo |

Opções de `ocupacaoIndigena.vulnerabilidades[]`: `Garimpo`, `Empreendimento de grande porte`, `Conflito deflagrado`, `Conflito latente`, `Danos ambientais`, `Inacessibilidade a políticas públicas`, `Risco habitacional`, `Outros`.

Estrutura de `ocupacaoIndigena.detalhesVulnerabilidades[]`:

| Campo JSON | Rótulo |
|---|---|
| `criterio` | Critério |
| `criterioDescricao` | Descrição do critério, quando for `Outros` |
| `fonte` | Fonte do dado |
| `dataReferencia` | De quando é o dado? |

Opções de `ocupacaoIndigena.tiposComunidadeTradicional[]`: `Indígenas`, `Quilombolas`, `Povos de Terreiro`, `Povos de Matriz Africana`, `Ciganos`, `Pescadores Artesanais`, `Marisqueiras`, `Ribeirinhos`, `Caiçaras`, `Extrativistas`, `Extrativistas Costeiros e Marinhos`, `Seringueiros`, `Castanheiros`, `Quebradeiras de Coco Babaçu`, `Comunidades de Fundo e Fecho de Pasto`, `Faxinalenses`, `Pantaneiros`, `Geraizeiros`, `Veredeiros`, `Caatingueiros`, `Vazanteiros`, `Retireiros do Araguaia`, `Praieiros`, `Jangadeiros`, `Açorianos`, `Campeiros`, `Sertanejos`, `Apanhadores de Flores Sempre-vivas`, `Raizeiros`, `Benzedeiras`, `Pomeranos`, `Ilhéus`, `Caboclos`, `Outros`.

Estrutura de `ocupacaoIndigena.detalhesComunidadesTradicionais[]`:

| Campo JSON | Rótulo |
|---|---|
| `tipo` | Comunidade |
| `fonte` | Fonte do dado |
| `dataReferencia` | De quando é o dado? |

Opções de `ocupacaoIndigena.tiposConflito[]`: `Interétnico`, `Fundiário`, `Outro`.

Estrutura de `ocupacaoIndigena.detalhesConflitos[]`:

| Campo JSON | Rótulo |
|---|---|
| `tipo` | Tipo de conflito |
| `outroTipoConflito` | Qual outro tipo? |
| `descricao` | Descreva |
| `dataReferencia` | De quando é o dado? |
| `envolvidos` | Envolvidos |
| `etniaRelacionada` | Etnia relacionada, texto consolidado |
| `etniasRelacionadas[]` | Etnias relacionadas, lista |
| `fonte` | Fonte do dado |

Campos resumidos do primeiro conflito/vulnerabilidade/comunidade, mantidos no JSON: `ocupacaoIndigena.fonteVulnerabilidade`, `ocupacaoIndigena.dataReferenciaVulnerabilidade`, `ocupacaoIndigena.dataReferenciaComunidadeTradicional`, `ocupacaoIndigena.outroTipoConflito`, `ocupacaoIndigena.envolvidosConflito`, `ocupacaoIndigena.motivoConflitoInteretnico`, `ocupacaoIndigena.etniaConflitoInteretnico`, `ocupacaoIndigena.dataReferenciaConflitoInteretnico`, `ocupacaoIndigena.fonteConflito`.

## Campos obrigatórios principais

Pelo HTML/validação visível, os obrigatórios principais são:

| Campo | JSON |
|---|---|
| Nome completo do(a) consultor(a) | `consultor.nome` |
| Área de estudo | `consultor.areaEstudo` |
| ID | `reivindicacao.id` |
| Nome da reivindicação | `reivindicacao.nome` |
| Há outros nomes? | `reivindicacao.outrosNomes` |
| Há roteiro? | `reivindicacao.temRoteiro` |
| Tipo da demanda | `reivindicacao.tipoDemanda[]` |
| Descrição da reivindicação | `resumoProcesso.descricao` |

