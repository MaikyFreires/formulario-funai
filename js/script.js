const POWER_AUTOMATE_URL = window.APP_CONFIG.POWER_AUTOMATE_URL;
const VERIFY_ACCESS_URL = window.APP_CONFIG.VERIFY_ACCESS_URL;
const LIST_DRAFTS_URL = window.APP_CONFIG.LIST_DRAFTS_URL;
const LOAD_DRAFT_URL = window.APP_CONFIG.LOAD_DRAFT_URL || "";
const LIST_SENT_URL = window.APP_CONFIG.LIST_SENT_URL || "";
const SECRET_TOKEN = "FUNAI_FORM_SECRET_2026";
const AUTHORIZED_EMAIL_KEY = "consultorEmailAutorizado";
const ACCESS_SESSION_KEY = "consultorSessaoAtiva";
const ACTIVE_FORM_ID_KEY = "formularioIdAtivo";
const MUNICIPIOS_CSV_URL = "data/municipios-estados.csv";
const HTML_PARTIALS = ["html/acesso.html", "html/dashboard.html", "html/formulario.html"];
const ETNIA_OPTIONS = [
  "Apurinã",
  "Ashaninka",
  "Baniwa",
  "Baré",
  "Guajajara",
  "Guarani",
  "Huni Kuin",
  "Kaingang",
  "Karajá",
  "Kayapó",
  "Kokama",
  "Macuxi",
  "Munduruku",
  "Pankararu",
  "Pataxó",
  "Potiguara",
  "Tikuna",
  "Tukano",
  "Wapichana",
  "Yanomami",
  "Outros"
];

let formApp;
let accessGate;
let accessForm;
let accessEmail;
let accessSubmitBtn;
let accessMessage;
let consultorDashboard;
let dashboardEmail;
let newReportBtn;
let draftReportsBtn;
let sentReportsBtn;
let reportListPanel;
let reportListTitle;
let reportListMessage;
let reportList;
let closeReportListBtn;
let form;
let steps = [];
let progressBar;
let progressTitle;
let stepCounter;
let prevBtn;
let nextBtn;
let submitBtn;
let saveDraftBtn;
let homeBtn;
let messageBox;
let etniaInput;
let etniaOptions;
let etniaChips;
let addEtniaBtn;
let processList;
let addProcessBtn;
let removeProcessBtn;
let estadoInput;
let estadoOptions;
let estadoChips;
let addEstadoBtn;
let municipioInput;
let municipioOptions;
let municipioChips;
let addMunicipioBtn;

let currentStep = 0;
let selectedEtnias = [];
let selectedEstados = [];
let selectedMunicipios = [];
let municipiosPorEstado = new Map();
let allEstados = [];
let formInitialized = false;
let currentFormularioId = "";
let cachedReports = [];

init();

// Bootstrap
async function init() {
  await loadHtmlPartials();
  cacheDomElements();
  bindAccessEvents();

  const authorizedEmail = getStoredAuthorizedEmail();
  if (hasActiveSession() && authorizedEmail) {
    showDashboard(authorizedEmail);
    return;
  }

  showAccessScreen();
}

async function loadHtmlPartials() {
  const appRoot = document.querySelector("#appRoot");
  const partials = await Promise.all(
    HTML_PARTIALS.map(async (path) => {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Nao foi possivel carregar ${path}`);
      return response.text();
    })
  );

  appRoot.innerHTML = partials.join("\n");
}

function cacheDomElements() {
  formApp = document.querySelector("#formApp");
  accessGate = document.querySelector("#accessGate");
  accessForm = document.querySelector("#accessForm");
  accessEmail = document.querySelector("#accessEmail");
  accessSubmitBtn = document.querySelector("#accessSubmitBtn");
  accessMessage = document.querySelector("#accessMessage");
  consultorDashboard = document.querySelector("#consultorDashboard");
  dashboardEmail = document.querySelector("#dashboardEmail");
  newReportBtn = document.querySelector("#newReportBtn");
  draftReportsBtn = document.querySelector("#draftReportsBtn");
  sentReportsBtn = document.querySelector("#sentReportsBtn");
  reportListPanel = document.querySelector("#reportListPanel");
  reportListTitle = document.querySelector("#reportListTitle");
  reportListMessage = document.querySelector("#reportListMessage");
  reportList = document.querySelector("#reportList");
  closeReportListBtn = document.querySelector("#closeReportListBtn");
  form = document.querySelector("#funaiForm");
  steps = Array.from(document.querySelectorAll(".step"));
  progressBar = document.querySelector("#progressBar");
  progressTitle = document.querySelector("#progressTitle");
  stepCounter = document.querySelector("#stepCounter");
  prevBtn = document.querySelector("#prevBtn");
  nextBtn = document.querySelector("#nextBtn");
  submitBtn = document.querySelector("#submitBtn");
  saveDraftBtn = document.querySelector("#saveDraftBtn");
  homeBtn = document.querySelector("#homeBtn");
  messageBox = document.querySelector("#formMessage");
  etniaInput = document.querySelector("#etniaInput");
  etniaOptions = document.querySelector("#etniaOptions");
  etniaChips = document.querySelector("#etniaChips");
  addEtniaBtn = document.querySelector("#addEtniaBtn");
  processList = document.querySelector("#processList");
  addProcessBtn = document.querySelector("#addProcessBtn");
  removeProcessBtn = document.querySelector("#removeProcessBtn");
  estadoInput = document.querySelector("#estadoInput");
  estadoOptions = document.querySelector("#estadoOptions");
  estadoChips = document.querySelector("#estadoChips");
  addEstadoBtn = document.querySelector("#addEstadoBtn");
  municipioInput = document.querySelector("#municipioInput");
  municipioOptions = document.querySelector("#municipioOptions");
  municipioChips = document.querySelector("#municipioChips");
  addMunicipioBtn = document.querySelector("#addMunicipioBtn");
}

function bindAccessEvents() {
  accessForm.addEventListener("submit", handleAccessSubmit);
  newReportBtn.addEventListener("click", novoRelatorio);
  draftReportsBtn.addEventListener("click", () => listarRascunhos());
  sentReportsBtn.addEventListener("click", () => listarEnviados());
  closeReportListBtn.addEventListener("click", hideReportList);
}

async function handleAccessSubmit(event) {
  event.preventDefault();
  clearAccessMessage();

  const email = accessEmail.value.trim().toLowerCase();
  if (!accessEmail.checkValidity() || !email) {
    showAccessMessage("Informe um e-mail válido.", "error");
    accessEmail.classList.add("invalid");
    return;
  }

  if (!VERIFY_ACCESS_URL) {
    showAccessMessage("Configure VERIFY_ACCESS_URL no arquivo js/config.js.", "error");
    return;
  }

  accessEmail.classList.remove("invalid");
  accessSubmitBtn.disabled = true;
  accessSubmitBtn.textContent = "Verificando...";

  try {
    const response = await fetch(VERIFY_ACCESS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        consultor: {
          email
        }
      })
    });
    const data = await response.json();
    console.log(data);

    if (data.autorizado === true || data.success === true) {
      storeAuthorizedEmail(email);
      startAccessSession();
      showDashboard(email);
      return;
    }

    if (data.autorizado === false) {
      showAccessMessage("E-mail não autorizado.", "error");
      return;
    }

    showAccessMessage("Não foi possível confirmar a autorização do e-mail.", "error");
  } catch (error) {
    showAccessMessage("Não foi possível verificar o e-mail. Tente novamente.", "error");
  } finally {
    accessSubmitBtn.disabled = false;
    accessSubmitBtn.textContent = "Acessar formulário";
  }
}

function showDashboard(email = getAuthorizedEmail()) {
  if (!hasActiveSession()) {
    showAccessScreen();
    return;
  }

  accessGate.hidden = true;
  consultorDashboard.hidden = false;
  formApp.hidden = true;
  dashboardEmail.textContent = email;
  hideReportList();
}

function showAccessScreen() {
  accessGate.hidden = false;
  consultorDashboard.hidden = true;
  formApp.hidden = true;
  currentFormularioId = "";
  sessionStorage.removeItem(ACTIVE_FORM_ID_KEY);
}

// Form lifecycle
async function initializeForm() {
  if (formInitialized) return;
  formInitialized = true;
  populateEtniaOptions();
  await loadMunicipioData();
  bindEvents();
  updateConditionals();
  showStep(0);
}

async function novoRelatorio() {
  currentFormularioId = createFormularioId();
  sessionStorage.setItem(ACTIVE_FORM_ID_KEY, currentFormularioId);
  await openForm({ reset: true });
}

async function startNewReport() {
  return novoRelatorio();
}

async function openForm({ reset = false } = {}) {
  const email = getStoredAuthorizedEmail();
  if (!email || !hasActiveSession()) {
    showAccessScreen();
    return;
  }

  await initializeForm();
  if (reset) limparFormulario();
  setAuthorizedEmail(email);
  accessGate.hidden = true;
  consultorDashboard.hidden = true;
  formApp.hidden = false;
  showStep(0);
}

function limparFormulario() {
  form.reset();
  selectedEtnias = [];
  selectedEstados = [];
  selectedMunicipios = [];
  renderEtniaChips();
  renderEstadoChips();
  renderMunicipioChips();
  populateEstadoOptions();
  populateMunicipioOptions();
  clearMessage();
  updateConditionals();
}

function setAuthorizedEmail(email) {
  const field = form.elements.consultorEmail;
  if (!field) return;

  field.value = email;
  field.readOnly = true;
}

function bindEvents() {
  form.addEventListener("input", handleFormChange);
  form.addEventListener("change", handleFormChange);
  form.addEventListener("submit", enviarFormulario);
  addEtniaBtn.addEventListener("click", addSelectedEtnia);
  etniaInput.addEventListener("keydown", handleEtniaKeydown);
  etniaChips.addEventListener("click", removeSelectedEtnia);
  addEstadoBtn.addEventListener("click", addSelectedEstado);
  estadoInput.addEventListener("keydown", handleEstadoKeydown);
  estadoChips.addEventListener("click", removeSelectedEstado);
  addMunicipioBtn.addEventListener("click", addSelectedMunicipio);
  municipioInput.addEventListener("keydown", handleMunicipioKeydown);
  municipioChips.addEventListener("click", removeSelectedMunicipio);
  addProcessBtn.addEventListener("click", () => addProcessField());
  removeProcessBtn.addEventListener("click", removeProcessField);
  prevBtn.addEventListener("click", goToPreviousStep);
  nextBtn.addEventListener("click", goToNextStep);
  saveDraftBtn.addEventListener("click", salvarRascunho);
  homeBtn.addEventListener("click", confirmReturnHome);
}

function handleFormChange() {
  clearMessage();
  updateConditionals();
}

function showStep(index) {
  currentStep = index;

  steps.forEach((step, stepIndex) => {
    step.classList.toggle("is-active", stepIndex === currentStep);
  });

  const progress = Math.round(((currentStep + 1) / steps.length) * 100);
  const title = steps[currentStep].dataset.title;

  progressBar.style.width = `${progress}%`;
  progressTitle.textContent = title;
  stepCounter.textContent = `Etapa ${currentStep + 1} de ${steps.length}`;

  prevBtn.hidden = false;
  prevBtn.disabled = currentStep === 0;
  nextBtn.hidden = currentStep === steps.length - 1;
  submitBtn.hidden = currentStep !== steps.length - 1;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goToNextStep() {
  if (!validateCurrentStep()) return;
  showStep(Math.min(currentStep + 1, steps.length - 1));
}

function goToPreviousStep() {
  if (currentStep === 0) return;
  showStep(Math.max(currentStep - 1, 0));
}

function confirmReturnHome() {
  showReturnHomeDialog();
}

function showReturnHomeDialog() {
  const overlay = document.createElement("div");
  const dialog = document.createElement("section");
  const title = document.createElement("h2");
  const actions = document.createElement("div");
  const keepEditingBtn = document.createElement("button");
  const returnHomeBtn = document.createElement("button");

  overlay.className = "confirm-overlay";
  dialog.className = "confirm-dialog";
  title.textContent = "Deseja sair do formulário atual?";
  actions.className = "confirm-actions";
  keepEditingBtn.type = "button";
  keepEditingBtn.className = "ghost";
  keepEditingBtn.textContent = "Continuar editando";
  returnHomeBtn.type = "button";
  returnHomeBtn.textContent = "Voltar ao início";

  keepEditingBtn.addEventListener("click", () => overlay.remove());
  returnHomeBtn.addEventListener("click", () => {
    overlay.remove();
    showDashboard(getAuthorizedEmail());
  });

  actions.append(keepEditingBtn, returnHomeBtn);
  dialog.append(title, actions);
  overlay.append(dialog);
  document.body.append(overlay);
}

function updateConditionals() {
  setConditional("outrosNomesDetalhe", getValue("outrosNomes") === "Sim");
  setConditional("dataRoteiroWrap", getValue("temRoteiro") === "Sim", ["dataRoteiro"]);
  setConditional("outraEtniaWrap", selectedEtnias.includes("Outros"));
  if (getValue("temRoteiro") === "Sim" && !getValue("dataRoteiro")) {
    form.elements.dataRoteiro.value = getTodayDate();
  }
  setConditional("judicializadoDetalhes", getValue("estaJudicializado") === "Sim");
  setConditional("decisaoDetalhes", getValue("temDecisao") === "Sim");
  setConditional("coordenadasWrap", getValue("temCoordenadas") === "Sim");
  setConditional("sobreposicoesWrap", getValue("sobreposicoes") === "Sim");
  setConditional("indigenasAreaWrap", getValue("indigenasArea") === "Sim");
  setConditional("comunidadesTradicionaisWrap", getValue("comunidadesTradicionais") === "Sim");

  const demandas = getCheckedValues("tipoDemanda");
  setConditional("modalidadeReservaWrap", demandas.includes("Reserva Indígena"));
  setConditional("justificativaRevisaoWrap", demandas.includes("Revisão de limites"));
}

function setConditional(id, isVisible, requiredNames = []) {
  const element = document.getElementById(id);
  if (!element) return;

  element.classList.toggle("is-visible", isVisible);
  element.querySelectorAll("input, select, textarea").forEach((field) => {
    if (!isVisible) {
      field.classList.remove("invalid");
      if (requiredNames.includes(field.name)) field.required = false;
      return;
    }

    if (requiredNames.includes(field.name)) field.required = true;
  });
}

function validateCurrentStep() {
  updateConditionals();
  const activeStep = steps[currentStep];
  const fields = Array.from(activeStep.querySelectorAll("input, select, textarea"));
  const invalidFields = fields.filter((field) => isFieldVisible(field) && !field.checkValidity());

  activeStep.querySelectorAll(".invalid").forEach((field) => field.classList.remove("invalid"));
  invalidFields.forEach((field) => field.classList.add("invalid"));

  const tipoDemandaGroup = activeStep.querySelector("[data-required-group='tipoDemanda']");
  const demandInvalid = tipoDemandaGroup && getCheckedValues("tipoDemanda").length === 0;
  if (demandInvalid) tipoDemandaGroup.classList.add("invalid");
  if (tipoDemandaGroup && !demandInvalid) tipoDemandaGroup.classList.remove("invalid");

  if (invalidFields.length || demandInvalid) {
    showMessage("Preencha os campos obrigatórios antes de continuar.", "error");
    const firstInvalid = invalidFields[0] || tipoDemandaGroup;
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }

  clearMessage();
  return true;
}

async function enviarFormulario(event) {
  event.preventDefault();
  if (!validateCurrentStep()) return;

  const authorizedEmail = getStoredAuthorizedEmail();
  if (!authorizedEmail || !hasActiveSession()) {
    showAccessScreen();
    showAccessMessage("Informe seu e-mail para acessar o formulário.", "error");
    return;
  }

  setAuthorizedEmail(authorizedEmail);

  if (!POWER_AUTOMATE_URL) {
    showMessage("Configure POWER_AUTOMATE_URL no arquivo js/config.js antes de enviar.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  try {
    const response = await fetch(POWER_AUTOMATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildPayload("Enviado"))
    });
    console.log(response.status, response.statusText);

    if (response.ok) {
      showMessage("Formulário enviado com sucesso.", "success");
      sessionStorage.removeItem(ACTIVE_FORM_ID_KEY);
      showDashboard(authorizedEmail);
      return;
    }

    await readJsonIfAvailable(response);

    if (response.status === 403) {
      showMessage("Este e-mail não está autorizado a enviar o formulário.", "error");
      return;
    }

    throw new Error(`Falha no envio: ${response.status}`);
  } catch (error) {
    showMessage("Não foi possível enviar o formulário. Verifique a URL do Power Automate e tente novamente.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar formulário";
  }
}

async function handleSubmit(event) {
  return enviarFormulario(event);
}

function buildPayload(statusFormulario = "Enviado") {
  const etnias = asList(getSelectedEtnias());
  const estados = asList(getSelectedEstados());
  const municipios = asList(getSelectedMunicipios());
  const now = new Date().toISOString();
  const payload = {
    formularioId: asText(getCurrentFormularioId()),
    tokenSecreto: asText(SECRET_TOKEN),
    origem: "github-pages-funai",
    atualizadoEm: now,
    statusFormulario: asText(statusFormulario),
    consultor: {
      nome: asText(getValue("consultorNome")),
      email: asText(getAuthorizedEmail()),
      areaEstudo: asText(getValue("areaEstudo"))
    },
    reivindicacao: {
      id: asText(getValue("reivindicacaoId")),
      nome: asText(getValue("nomeReivindicacao")),
      outrosNomes: asText(getValue("outrosNomes")),
      outrosNomesTexto: asText(getValue("outrosNomesTexto")),
      numerosProcesso: asList(getProcessNumbers()),
      temRoteiro: asText(getValue("temRoteiro")),
      dataRoteiro: asText(getValue("dataRoteiro")),
      etnias,
      outraEtnia: asText(getValue("outraEtnia")),
      tipoDemanda: asList(getCheckedValues("tipoDemanda")),
      modalidadeConstituicao: asText(getValue("modalidadeConstituicao")),
      justificativaRevisao: asText(getValue("justificativaRevisao")),
      estado: asText(estados.join(", ")),
      estados,
      municipio: asText(municipios.join(", ")),
      municipios,
      coordenacaoRegional: asText(getValue("coordenacaoRegional")),
      temRetomada: asText(getValue("temRetomada")),
      detalhesRetomada: asText(getValue("detalhesRetomada"))
    },
    resumoProcesso: {
      descricao: asText(getValue("descricaoReivindicacao")),
      dataDocumento: asText(getValue("dataDocumento")),
      tipoDocumento: asText(getValue("tipoDocumento")),
      paginas: asText(getValue("paginasDocumento")),
      numeroSei: asText(getValue("numeroSei")),
      eventosAssuntos: asText(getValue("eventosAssuntos"))
    },
    statusProcesso: {
      estaJudicializado: asText(getValue("estaJudicializado")),
      acoesJudiciais: asList(getCheckedValues("acoesJudiciais")),
      descricaoAcao: asText(getValue("descricaoAcao")),
      temDecisao: asText(getValue("temDecisao")),
      numeroDecisao: asText(getValue("numeroDecisao")),
      dataDecisao: asText(getValue("dataDecisao")),
      sentenca: asText(getValue("sentenca"))
    },
    caracterizacaoArea: {
      localizacaoDemanda: asText(getValue("localizacaoDemanda")),
      temCoordenadas: asText(getValue("temCoordenadas")),
      latitude: asText(getValue("latitude")),
      longitude: asText(getValue("longitude")),
      comentarioCoordenada: asText(getValue("comentarioCoordenada")),
      bioma: asList(getCheckedValues("bioma")),
      aldeiasComunidades: asText(getValue("aldeiasComunidades")),
      contextoUrbano: asText(getValue("contextoUrbano")),
      faixaFronteira: asText(getValue("faixaFronteira")),
      sobreposicoes: asText(getValue("sobreposicoes")),
      tiposSobreposicao: asList(getCheckedValues("tiposSobreposicao")),
      detalheSobreposicoes: asText(getValue("detalheSobreposicoes"))
    },
    ocupacaoIndigena: {
      indigenasArea: asText(getValue("indigenasArea")),
      tempoOcupacao: asText(getValue("tempoOcupacao")),
      vulnerabilidades: asList(getCheckedValues("vulnerabilidades")),
      comunidadesTradicionais: asText(getValue("comunidadesTradicionais")),
      descricaoComunidadeTradicional: asText(getValue("descricaoComunidadeTradicional")),
      conflitoInteretnico: asText(getValue("conflitoInteretnico")),
      reintegracaoPosse: asText(getValue("reintegracaoPosse"))
    }
  };

  if (statusFormulario === "Enviado") payload.enviadoEm = now;
  return payload;
}

async function salvarRascunho() {
  const payload = buildPayload("Rascunho");
  console.log("payload rascunho", payload);

  if (!POWER_AUTOMATE_URL) {
    showMessage("Rascunho salvo no navegador, mas não foi enviado ao SharePoint.", "error");
    return;
  }

  saveDraftBtn.disabled = true;
  saveDraftBtn.textContent = "Salvando...";

  try {
    const response = await fetch(POWER_AUTOMATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    console.log(response.status, response.statusText);

    if (response.ok) {
      showMessage("Rascunho salvo no navegador e enviado ao SharePoint.", "success");
      return;
    }

    await readJsonIfAvailable(response);

    if (response.status === 403) {
      showMessage("Este e-mail não está autorizado.", "error");
      return;
    }

    throw new Error(`Falha no envio do rascunho: ${response.status}`);
  } catch (error) {
    showMessage("Rascunho salvo no navegador, mas não foi enviado ao SharePoint.", "error");
  } finally {
    saveDraftBtn.disabled = false;
    saveDraftBtn.textContent = "Salvar rascunho";
  }
}

async function saveDraft() {
  return salvarRascunho();
}

// Dashboard lists
async function listarRascunhos(email = getAuthorizedEmail()) {
  await listarRelatorios({
    title: "Meus rascunhos",
    url: LIST_DRAFTS_URL,
    emptyMessage: "Nenhum rascunho encontrado.",
    email
  });
}

async function listarEnviados() {
  await listarRelatorios({
    title: "Relatorios enviados",
    url: LIST_SENT_URL,
    emptyMessage: "Nenhum relatorio enviado encontrado."
  });
}

async function listarRelatorios({ title, url, emptyMessage, email = getAuthorizedEmail() }) {
  showReportList(title, "Carregando...");

  if (!url) {
    showReportListMessage("Configure a URL correspondente no arquivo js/config.js.", "error");
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        consultor: {
          email
        }
      })
    });
    console.log(response.status, response.statusText);

    if (!response.ok) throw new Error(`Falha ao listar relatorios: ${response.status}`);

    const data = await readJsonIfAvailable(response);
    const relatorios = normalizarListaRelatorios(data);
    renderReportList(relatorios, emptyMessage);
  } catch (error) {
    showReportListMessage("Nao foi possivel carregar a lista.", "error");
  }
}

async function abrirRascunho(formularioId) {
  const resumo = getCachedReport(formularioId);
  if (!resumo) {
    showReportListMessage("Rascunho nao encontrado nesta lista.", "error");
    return;
  }

  const id = getReportFormularioId(resumo) || asText(formularioId);
  if (!LOAD_DRAFT_URL) {
    showReportListMessage("Configure LOAD_DRAFT_URL no arquivo js/config.js.", "error");
    return;
  }

  try {
    showReportListMessage("Carregando rascunho...", "success");
    const response = await fetch(LOAD_DRAFT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        formularioId: id,
        consultor: {
          email: getAuthorizedEmail()
        }
      })
    });
    console.log(response.status, response.statusText);

    if (!response.ok) throw new Error(`Falha ao carregar rascunho: ${response.status}`);

    const data = await readJsonIfAvailable(response);
    const rascunho = normalizarRascunhoCarregado(data, resumo);

    currentFormularioId = getReportFormularioId(rascunho) || id;
    sessionStorage.setItem(ACTIVE_FORM_ID_KEY, currentFormularioId);
    await openForm({ reset: true });
    preencherFormulario(rascunho);
    updateConditionals();
    showStep(0);
  } catch (error) {
    showReportListMessage("Nao foi possivel abrir o rascunho.", "error");
  }
}

function normalizarRascunhoCarregado(data, fallback) {
  if (data?.relatorio) return data.relatorio;
  if (data?.rascunho) return data.rascunho;
  if (data?.item) return data.item;
  if (data?.value && !Array.isArray(data.value)) return data.value;
  return data || fallback;
}

async function carregarRelatorio(id) {
  return abrirRascunho(id);
}

function preencherFormulario(dados) {
  const formularioId = getReportFormularioId(dados);
  if (formularioId) {
    currentFormularioId = formularioId;
    sessionStorage.setItem(ACTIVE_FORM_ID_KEY, currentFormularioId);
  }

  restoreValues(flattenDraft(dados));
  setAuthorizedEmail(getAuthorizedEmail());
}

/* antigo fluxo local mantido como alias de compatibilidade */
async function carregarRelatorioLocal(formularioId) {
  const relatorio = getCachedReport(formularioId);
  if (!relatorio) return;

  currentFormularioId = getReportFormularioId(relatorio) || asText(formularioId);
  sessionStorage.setItem(ACTIVE_FORM_ID_KEY, currentFormularioId);
  await openForm({ reset: true });
  preencherFormulario(relatorio);
  updateConditionals();
  showStep(0);
}

function showReportList(title, message = "") {
  reportListPanel.hidden = false;
  reportListTitle.textContent = title;
  reportList.innerHTML = "";
  if (message) showReportListMessage(message, "success");
}

function hideReportList() {
  reportListPanel.hidden = true;
  reportList.innerHTML = "";
  reportListMessage.textContent = "";
  reportListMessage.className = "message";
}

function showReportListMessage(text, type) {
  reportListMessage.textContent = text;
  reportListMessage.className = `message is-visible ${type}`;
}

function normalizarListaRelatorios(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.relatorios)) return data.relatorios;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.value)) return data.value;
  return [];
}

function renderReportList(relatorios, emptyMessage) {
  cachedReports = relatorios;
  reportList.innerHTML = "";

  if (!relatorios.length) {
    showReportListMessage(emptyMessage, "success");
    return;
  }

  reportListMessage.textContent = "";
  reportListMessage.className = "message";

  relatorios.forEach((relatorio) => {
    const formularioId = relatorio.FormularioId || relatorio.formularioId;
    const reivindicacaoId = relatorio.ReivindicacaoId || relatorio.field_2 || relatorio.reivindicacaoId || "Sem ID";
    const nomeReivindicacao = relatorio.NomeReivindicacao || relatorio.field_3 || relatorio.nomeReivindicacao || "Sem nome";
    const atualizadoEm = relatorio.Modified || relatorio.AtualizadoEm || relatorio.enviadoEm || relatorio.EnviadoEm || "";
    const status = asText(relatorio.statusFormulario || relatorio.StatusFormulario || "Rascunho");
    const row = document.createElement("div");
    const idButton = document.createElement("button");
    const name = document.createElement("span");
    const date = document.createElement("span");
    const statusText = document.createElement("span");

    row.className = "report-list-row";
    idButton.type = "button";
    idButton.className = "report-link";
    idButton.textContent = reivindicacaoId;
    idButton.addEventListener("click", () => abrirRascunho(formularioId));
    idButton.disabled = !formularioId;

    name.textContent = nomeReivindicacao;
    date.textContent = atualizadoEm;
    statusText.textContent = status;
    row.append(idButton, name, date, statusText);
    reportList.append(row);
  });
}

function getCachedReport(id) {
  return cachedReports.find((relatorio) => {
    const formId = getReportFormularioId(relatorio);
    const reivindicacaoId = getReportReivindicacaoId(relatorio);
    return formId === asText(id) || reivindicacaoId === asText(id);
  });
}

function getReportFormularioId(relatorio) {
  return asText(relatorio.formularioId || relatorio.FormularioId || relatorio.id || relatorio.ID);
}

function getReportReivindicacaoId(relatorio) {
  return asText(relatorio.reivindicacao?.id || relatorio.ReivindicacaoId || relatorio.field_2 || relatorio.reivindicacaoId);
}

function getReportNomeReivindicacao(relatorio) {
  return asText(relatorio.reivindicacao?.nome || relatorio.NomeReivindicacao || relatorio.field_3 || relatorio.nomeReivindicacao || relatorio.titulo);
}

function getReportAtualizadoEm(relatorio) {
  return asText(relatorio.Modified || relatorio.AtualizadoEm || relatorio.enviadoEm || relatorio.EnviadoEm || relatorio.atualizadoEm || relatorio.modificadoEm);
}

function restoreValues(values) {
  const etnias = asListOrSplit(values.etnias);
  const estados = asListOrSplit(values.estados);
  const municipios = asListOrSplit(values.municipios);
  const numerosProcesso = asListOrSplit(values.numerosProcesso);

  if (etnias.length) {
    selectedEtnias = etnias;
    renderEtniaChips();
  }

  if (estados.length) {
    selectedEstados = estados;
    renderEstadoChips();
    populateMunicipioOptions();
  }

  if (municipios.length) {
    selectedMunicipios = municipios;
    renderMunicipioChips();
  }

  if (numerosProcesso.length) {
    restoreProcessFields(numerosProcesso);
  }

  Object.entries(values).forEach(([name, value]) => {
    if (name === "etnias" || name === "estados" || name === "municipios" || name === "numerosProcesso") return;
    if (value === undefined) return;

    const element = form.elements[name];
    if (!element) return;

    const fieldList = element instanceof RadioNodeList ? Array.from(element) : [element];

    fieldList.forEach((field) => {
      if (field.type === "checkbox") {
        field.checked = asListOrSplit(value).includes(field.value);
      } else if (field.type === "radio") {
        field.checked = field.value === value;
      } else if (field.tagName === "SELECT") {
        const hasOption = Array.from(field.options).some((option) => option.value === value || option.textContent === value);
        field.value = hasOption ? value || "" : "";
      } else {
        field.value = value || "";
      }
    });
  });
}

function flattenDraft(draft) {
  return {
    consultorEmail: draft.consultor?.email || draft.consultorEmail,
    consultorNome: draft.consultor?.nome || draft.consultorNome,
    areaEstudo: draft.consultor?.areaEstudo || draft.areaEstudo,
    reivindicacaoId: draft.reivindicacao?.id || draft.reivindicacaoId || draft.ReivindicacaoId,
    nomeReivindicacao: draft.reivindicacao?.nome || draft.nomeReivindicacao || draft.NomeReivindicacao,
    outrosNomes: draft.reivindicacao?.outrosNomes || draft.outrosNomes,
    outrosNomesTexto: draft.reivindicacao?.outrosNomesTexto || draft.outrosNomesTexto,
    numerosProcesso: draft.reivindicacao?.numerosProcesso || draft.numerosProcesso || splitLegacyList(draft.reivindicacao?.numeroProcesso || draft.numeroProcesso),
    temRoteiro: draft.reivindicacao?.temRoteiro || draft.temRoteiro,
    dataRoteiro: draft.reivindicacao?.dataRoteiro || draft.dataRoteiro,
    etnias: draft.reivindicacao?.etnias || draft.etnias,
    outraEtnia: draft.reivindicacao?.outraEtnia || draft.outraEtnia,
    tipoDemanda: draft.reivindicacao?.tipoDemanda || draft.tipoDemanda,
    modalidadeConstituicao: draft.reivindicacao?.modalidadeConstituicao || draft.modalidadeConstituicao,
    justificativaRevisao: draft.reivindicacao?.justificativaRevisao || draft.justificativaRevisao,
    estados: draft.reivindicacao?.estados || draft.estados || splitLegacyList(draft.reivindicacao?.estado || draft.estado),
    municipios: draft.reivindicacao?.municipios || draft.municipios || splitLegacyList(draft.reivindicacao?.municipio || draft.municipio),
    coordenacaoRegional: draft.reivindicacao?.coordenacaoRegional || draft.coordenacaoRegional,
    temRetomada: draft.reivindicacao?.temRetomada || draft.temRetomada,
    detalhesRetomada: draft.reivindicacao?.detalhesRetomada || draft.detalhesRetomada,
    descricaoReivindicacao: draft.resumoProcesso?.descricao,
    dataDocumento: draft.resumoProcesso?.dataDocumento,
    tipoDocumento: draft.resumoProcesso?.tipoDocumento,
    paginasDocumento: draft.resumoProcesso?.paginas,
    numeroSei: draft.resumoProcesso?.numeroSei,
    eventosAssuntos: draft.resumoProcesso?.eventosAssuntos,
    estaJudicializado: draft.statusProcesso?.estaJudicializado,
    acoesJudiciais: draft.statusProcesso?.acoesJudiciais,
    descricaoAcao: draft.statusProcesso?.descricaoAcao,
    temDecisao: draft.statusProcesso?.temDecisao,
    numeroDecisao: draft.statusProcesso?.numeroDecisao,
    dataDecisao: draft.statusProcesso?.dataDecisao,
    sentenca: draft.statusProcesso?.sentenca,
    localizacaoDemanda: draft.caracterizacaoArea?.localizacaoDemanda,
    temCoordenadas: draft.caracterizacaoArea?.temCoordenadas,
    latitude: draft.caracterizacaoArea?.latitude,
    longitude: draft.caracterizacaoArea?.longitude,
    comentarioCoordenada: draft.caracterizacaoArea?.comentarioCoordenada,
    bioma: draft.caracterizacaoArea?.bioma,
    aldeiasComunidades: draft.caracterizacaoArea?.aldeiasComunidades,
    contextoUrbano: draft.caracterizacaoArea?.contextoUrbano,
    faixaFronteira: draft.caracterizacaoArea?.faixaFronteira,
    sobreposicoes: draft.caracterizacaoArea?.sobreposicoes,
    tiposSobreposicao: draft.caracterizacaoArea?.tiposSobreposicao,
    detalheSobreposicoes: draft.caracterizacaoArea?.detalheSobreposicoes,
    indigenasArea: draft.ocupacaoIndigena?.indigenasArea,
    tempoOcupacao: draft.ocupacaoIndigena?.tempoOcupacao,
    vulnerabilidades: draft.ocupacaoIndigena?.vulnerabilidades,
    comunidadesTradicionais: draft.ocupacaoIndigena?.comunidadesTradicionais,
    descricaoComunidadeTradicional: draft.ocupacaoIndigena?.descricaoComunidadeTradicional,
    conflitoInteretnico: draft.ocupacaoIndigena?.conflitoInteretnico,
    reintegracaoPosse: draft.ocupacaoIndigena?.reintegracaoPosse
  };
}

function splitLegacyList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getAuthorizedEmail() {
  return getStoredAuthorizedEmail() || getValue("consultorEmail");
}

function getCurrentFormularioId() {
  if (!currentFormularioId) currentFormularioId = sessionStorage.getItem(ACTIVE_FORM_ID_KEY) || "";
  if (!currentFormularioId) throw new Error("Formulario sem formularioId ativo.");
  sessionStorage.setItem(ACTIVE_FORM_ID_KEY, currentFormularioId);
  return currentFormularioId;
}

function createFormularioId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `form-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function asText(value) {
  return value == null ? "" : String(value);
}

function asList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function asListOrSplit(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return splitLegacyList(value);
}

async function readJsonIfAvailable(response) {
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;

  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function getStoredAuthorizedEmail() {
  return sessionStorage.getItem(AUTHORIZED_EMAIL_KEY) || "";
}

function storeAuthorizedEmail(email) {
  sessionStorage.setItem(AUTHORIZED_EMAIL_KEY, email);
}

function startAccessSession() {
  sessionStorage.setItem(ACCESS_SESSION_KEY, createFormularioId());
}

function hasActiveSession() {
  return Boolean(sessionStorage.getItem(ACCESS_SESSION_KEY));
}

function getValue(name) {
  const field = form.elements[name];
  if (!field) return "";
  return String(field.value || "").trim();
}

function getCheckedValues(name) {
  return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((field) => field.value);
}

function populateEtniaOptions() {
  etniaOptions.innerHTML = ETNIA_OPTIONS.map((etnia) => `<option value="${etnia}"></option>`).join("");
}

async function loadMunicipioData() {
  try {
    const response = await fetch(MUNICIPIOS_CSV_URL);
    if (!response.ok) throw new Error(`Falha ao carregar ${MUNICIPIOS_CSV_URL}`);

    const csvText = await response.text();
    municipiosPorEstado = parseMunicipiosCsv(csvText);
    allEstados = Array.from(municipiosPorEstado.keys()).sort(sortPortuguese);
    populateEstadoOptions();
    populateMunicipioOptions();
  } catch (error) {
    estadoInput.placeholder = "Não foi possível carregar estados";
    municipioInput.placeholder = "Não foi possível carregar municípios";
    populateMunicipioOptions();
  }
}

function parseMunicipiosCsv(csvText) {
  const rows = parseDelimitedRows(csvText, ";");
  const [, ...dataRows] = rows;
  const grouped = new Map();

  dataRows.forEach((row) => {
    const municipio = String(row[0] || "").trim();
    const estado = String(row[1] || "").trim();
    if (!municipio || !estado) return;
    if (!grouped.has(estado)) grouped.set(estado, new Set());
    grouped.get(estado).add(municipio);
  });

  return new Map(
    Array.from(grouped.entries()).map(([estado, municipios]) => [
      estado,
      Array.from(municipios).sort(sortPortuguese)
    ])
  );
}

function parseDelimitedRows(text, delimiter) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && nextChar === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function sortPortuguese(a, b) {
  return a.localeCompare(b, "pt-BR");
}

function populateEstadoOptions() {
  estadoOptions.innerHTML = allEstados
    .filter((estado) => !selectedEstados.includes(estado))
    .map((estado) => `<option value="${estado}"></option>`)
    .join("");
}

function populateMunicipioOptions() {
  const municipios = getAvailableMunicipios();
  municipioOptions.innerHTML = municipios
    .filter((municipio) => !selectedMunicipios.includes(municipio))
    .map((municipio) => `<option value="${municipio}"></option>`)
    .join("");

  const hasEstados = selectedEstados.length > 0;
  municipioInput.disabled = !hasEstados;
  addMunicipioBtn.disabled = !hasEstados;
  municipioInput.placeholder = hasEstados ? "Localizar municípios" : "Selecione um estado primeiro";
}

function getAvailableMunicipios() {
  const selectedSet = new Set();
  selectedEstados.forEach((estado) => {
    const municipios = municipiosPorEstado.get(estado) || [];
    municipios.forEach((municipio) => selectedSet.add(municipio));
  });

  return Array.from(selectedSet).sort(sortPortuguese);
}

function handleEtniaKeydown(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addSelectedEtnia();
}

function addSelectedEtnia() {
  const value = etniaInput.value.trim();
  if (!value || selectedEtnias.includes(value)) return;

  selectedEtnias.push(value);
  etniaInput.value = "";
  renderEtniaChips();
  updateConditionals();
}

function removeSelectedEtnia(event) {
  const button = event.target.closest("button[data-etnia]");
  if (!button) return;

  selectedEtnias = selectedEtnias.filter((etnia) => etnia !== button.dataset.etnia);
  renderEtniaChips();
  updateConditionals();
}

function renderEtniaChips() {
  etniaChips.innerHTML = "";
  selectedEtnias.forEach((etnia) => {
    const chip = document.createElement("span");
    const removeButton = document.createElement("button");

    chip.className = "chip";
    chip.append(document.createTextNode(etnia));
    removeButton.type = "button";
    removeButton.dataset.etnia = etnia;
    removeButton.setAttribute("aria-label", `Remover ${etnia}`);
    removeButton.textContent = "×";
    chip.append(removeButton);
    etniaChips.append(chip);
  });
}

function getSelectedEtnias() {
  return selectedEtnias.filter(Boolean);
}

function handleEstadoKeydown(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addSelectedEstado();
}

function addSelectedEstado() {
  const value = estadoInput.value.trim();
  if (!value || selectedEstados.includes(value) || !allEstados.includes(value)) return;

  selectedEstados.push(value);
  estadoInput.value = "";
  renderEstadoChips();
  populateEstadoOptions();
  pruneSelectedMunicipios();
  populateMunicipioOptions();
}

function removeSelectedEstado(event) {
  const button = event.target.closest("button[data-estado]");
  if (!button) return;

  selectedEstados = selectedEstados.filter((estado) => estado !== button.dataset.estado);
  renderEstadoChips();
  populateEstadoOptions();
  pruneSelectedMunicipios();
  populateMunicipioOptions();
}

function renderEstadoChips() {
  renderChips(estadoChips, selectedEstados, "estado", "Remover estado");
}

function getSelectedEstados() {
  return selectedEstados.filter(Boolean);
}

function handleMunicipioKeydown(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addSelectedMunicipio();
}

function addSelectedMunicipio() {
  const value = municipioInput.value.trim();
  const municipios = getAvailableMunicipios();
  if (!value || selectedMunicipios.includes(value) || !municipios.includes(value)) return;

  selectedMunicipios.push(value);
  municipioInput.value = "";
  renderMunicipioChips();
  populateMunicipioOptions();
}

function removeSelectedMunicipio(event) {
  const button = event.target.closest("button[data-municipio]");
  if (!button) return;

  selectedMunicipios = selectedMunicipios.filter((municipio) => municipio !== button.dataset.municipio);
  renderMunicipioChips();
  populateMunicipioOptions();
}

function renderMunicipioChips() {
  renderChips(municipioChips, selectedMunicipios, "municipio", "Remover município");
}

function getSelectedMunicipios() {
  return selectedMunicipios.filter(Boolean);
}

function pruneSelectedMunicipios() {
  const availableMunicipios = getAvailableMunicipios();
  selectedMunicipios = selectedMunicipios.filter((municipio) => availableMunicipios.includes(municipio));
  renderMunicipioChips();
}

function renderChips(container, values, dataName, ariaPrefix) {
  container.innerHTML = "";
  values.forEach((value) => {
    const chip = document.createElement("span");
    const removeButton = document.createElement("button");

    chip.className = "chip";
    chip.append(document.createTextNode(value));
    removeButton.type = "button";
    removeButton.dataset[dataName] = value;
    removeButton.setAttribute("aria-label", `${ariaPrefix} ${value}`);
    removeButton.textContent = "×";
    chip.append(removeButton);
    container.append(chip);
  });
}

function addProcessField(value = "") {
  const label = document.createElement("label");
  const input = document.createElement("input");

  label.className = "process-field";
  input.name = "numeroProcesso";
  input.type = "text";
  input.value = value;
  label.append(document.createTextNode("Nº do processo"), input);
  processList.insertBefore(label, processList.querySelector(".process-buttons"));
  input.focus();
}

function removeProcessField() {
  const fields = Array.from(processList.querySelectorAll(".process-field"));
  const last = fields[fields.length - 1];
  if (fields.length > 1) {
    last.remove();
    fields[fields.length - 2].querySelector("input").focus();
    return;
  }

  last.querySelector("input").value = "";
  last.querySelector("input").focus();
}

function restoreProcessFields(numbers) {
  const values = numbers.filter(Boolean);
  const existing = Array.from(processList.querySelectorAll(".process-field"));
  existing.slice(1).forEach((field) => field.remove());
  existing[0].querySelector("input").value = values[0] || "";
  values.slice(1).forEach((value) => addProcessField(value));
}

function getProcessNumbers() {
  return Array.from(processList.querySelectorAll(".process-field input"))
    .map((field) => field.value.trim())
    .filter(Boolean);
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isFieldVisible(field) {
  return Boolean(field.offsetParent);
}

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message is-visible ${type}`;
}

function clearMessage() {
  messageBox.textContent = "";
  messageBox.className = "message";
}

function showAccessMessage(text, type) {
  accessMessage.textContent = text;
  accessMessage.className = `message is-visible ${type}`;
}

function clearAccessMessage() {
  accessMessage.textContent = "";
  accessMessage.className = "message";
}
