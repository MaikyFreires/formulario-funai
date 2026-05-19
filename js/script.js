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
const ETNIAS_CSV_URL = "data/Etnias%20IBGE%20.csv";
const APP_VERSION = "20260518-28";
const DATE_BR_FIELD_NAMES = new Set([
  "dataRoteiro",
  "dataDocumento",
  "dataAcaoJudicial",
  "dataDecisao"
]);
const COMUNIDADES_TRADICIONAIS = [
  "Indígenas",
  "Quilombolas",
  "Povos de Terreiro",
  "Povos de Matriz Africana",
  "Ciganos",
  "Pescadores Artesanais",
  "Marisqueiras",
  "Ribeirinhos",
  "Caiçaras",
  "Extrativistas",
  "Extrativistas Costeiros e Marinhos",
  "Seringueiros",
  "Castanheiros",
  "Quebradeiras de Coco Babaçu",
  "Comunidades de Fundo e Fecho de Pasto",
  "Faxinalenses",
  "Pantaneiros",
  "Geraizeiros",
  "Veredeiros",
  "Caatingueiros",
  "Vazanteiros",
  "Retireiros do Araguaia",
  "Praieiros",
  "Jangadeiros",
  "Açorianos",
  "Campeiros",
  "Sertanejos",
  "Apanhadores de Flores Sempre-vivas",
  "Raizeiros",
  "Benzedeiras",
  "Pomeranos",
  "Ilhéus",
  "Caboclos",
  "Outros"
];
const HTML_PARTIALS = ["html/acesso.html", "html/dashboard.html", "html/formulario.html"];
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
let savePdfBtn;
let homeBtn;
let messageBox;
let etniaInput;
let etniaOptions;
let etniaChips;
let addEtniaBtn;
let outraEtniaInput;
let outraEtniaChips;
let addOutraEtniaBtn;
let processList;
let aldeiasList;
let aldeiaInput;
let aldeiaChips;
let addAldeiaBtn;
let documentosTableBody;
let addDocumentoBtn;
let estadoInput;
let estadoOptions;
let estadoChips;
let addEstadoBtn;
let municipioInput;
let municipioOptions;
let municipioChips;
let addMunicipioBtn;
let coordenadasTableBody;
let mapasTableBody;
let comunidadeTradicionalInput;
let comunidadeTradicionalOptions;
let comunidadeTradicionalChips;
let addComunidadeTradicionalBtn;
let comunidadeTradicionalDetalhes;

let currentStep = 0;
let selectedEtnias = [];
let selectedOutrasEtnias = [];
let selectedEstados = [];
let selectedMunicipios = [];
let selectedComunidadesTradicionais = [];
let selectedAldeiasComunidades = [];
let municipiosPorEstado = new Map();
let allEstados = [];
let allEtnias = [];
let formInitialized = false;
let currentFormularioId = "";
let cachedReports = [];
let currentReportListMode = "draft";
let activeFormMode = "edit";
let activePersistenceMode = "create";

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
      const response = await fetch(withCacheBust(path));
      if (!response.ok) throw new Error(`Nao foi possivel carregar ${path}`);
      return response.text();
    })
  );

  appRoot.innerHTML = partials.join("\n");
}

function withCacheBust(path) {
  return `${path}?v=${APP_VERSION}`;
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
  savePdfBtn = document.querySelector("#savePdfBtn");
  homeBtn = document.querySelector("#homeBtn");
  messageBox = document.querySelector("#formMessage");
  etniaInput = document.querySelector("#etniaInput");
  etniaOptions = document.querySelector("#etniaOptions");
  etniaChips = document.querySelector("#etniaChips");
  addEtniaBtn = document.querySelector("#addEtniaBtn");
  outraEtniaInput = document.querySelector("#outraEtniaInput");
  outraEtniaChips = document.querySelector("#outraEtniaChips");
  addOutraEtniaBtn = document.querySelector("#addOutraEtniaBtn");
  processList = document.querySelector("#processList");
  aldeiasList = document.querySelector("#aldeiasList");
  aldeiaInput = document.querySelector("#aldeiaInput");
  aldeiaChips = document.querySelector("#aldeiaChips");
  addAldeiaBtn = document.querySelector("#addAldeiaBtn");
  documentosTableBody = document.querySelector("#documentosTableBody");
  addDocumentoBtn = document.querySelector("#addDocumentoBtn");
  estadoInput = document.querySelector("#estadoInput");
  estadoOptions = document.querySelector("#estadoOptions");
  estadoChips = document.querySelector("#estadoChips");
  addEstadoBtn = document.querySelector("#addEstadoBtn");
  municipioInput = document.querySelector("#municipioInput");
  municipioOptions = document.querySelector("#municipioOptions");
  municipioChips = document.querySelector("#municipioChips");
  addMunicipioBtn = document.querySelector("#addMunicipioBtn");
  coordenadasTableBody = document.querySelector("#coordenadasTableBody");
  mapasTableBody = document.querySelector("#mapasTableBody");
  comunidadeTradicionalInput = document.querySelector("#comunidadeTradicionalInput");
  comunidadeTradicionalOptions = document.querySelector("#comunidadeTradicionalOptions");
  comunidadeTradicionalChips = document.querySelector("#comunidadeTradicionalChips");
  addComunidadeTradicionalBtn = document.querySelector("#addComunidadeTradicionalBtn");
  comunidadeTradicionalDetalhes = document.querySelector("#comunidadeTradicionalDetalhes");
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
  await loadEtniaData();
  await loadMunicipioData();
  populateComunidadeTradicionalOptions();
  bindEvents();
  updateConditionals();
  showStep(0);
}

async function novoRelatorio() {
  currentFormularioId = "";
  activePersistenceMode = "create";
  sessionStorage.removeItem(ACTIVE_FORM_ID_KEY);
  await openForm({ reset: true, mode: "edit" });
  currentFormularioId = createFormularioId();
  sessionStorage.setItem(ACTIVE_FORM_ID_KEY, currentFormularioId);
}

async function startNewReport() {
  return novoRelatorio();
}

async function openForm({ reset = false, mode = "edit" } = {}) {
  const email = getStoredAuthorizedEmail();
  if (!email || !hasActiveSession()) {
    showAccessScreen();
    return;
  }

  activeFormMode = mode;
  await initializeForm();
  if (reset) limparFormulario();
  setAuthorizedEmail(email);
  setFormViewMode(mode);
  accessGate.hidden = true;
  consultorDashboard.hidden = true;
  formApp.hidden = false;
  showStep(0);
}

function limparFormulario() {
  activePersistenceMode = "create";
  form.reset();
  selectedEtnias = [];
  selectedOutrasEtnias = [];
  selectedEstados = [];
  selectedMunicipios = [];
  selectedComunidadesTradicionais = [];
  selectedAldeiasComunidades = [];
  resetDocumentoRows();
  resetCoordenadaRows();
  resetMapaRows();
  carregarProcessosAnalisados();
  resetAldeiaFields();
  renderEtniaChips();
  renderOutraEtniaChips();
  renderEstadoChips();
  renderMunicipioChips();
  renderComunidadeTradicionalChips();
  renderAldeiaChips();
  renderComunidadeTradicionalDetalhes();
  populateEstadoOptions();
  populateMunicipioOptions();
  populateComunidadeTradicionalOptions();
  clearMessage();
  clearValidationErrors();
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
  form.addEventListener("input", handleDateMaskInput);
  form.addEventListener("change", handleFormChange);
  form.addEventListener("submit", enviarFormulario);
  addEtniaBtn.addEventListener("click", addSelectedEtnia);
  etniaInput.addEventListener("keydown", handleEtniaKeydown);
  etniaChips.addEventListener("click", removeSelectedEtnia);
  addOutraEtniaBtn.addEventListener("click", addSelectedOutraEtnia);
  outraEtniaInput.addEventListener("keydown", handleOutraEtniaKeydown);
  outraEtniaChips.addEventListener("click", removeSelectedOutraEtnia);
  addEstadoBtn.addEventListener("click", addSelectedEstado);
  estadoInput.addEventListener("keydown", handleEstadoKeydown);
  estadoChips.addEventListener("click", removeSelectedEstado);
  addMunicipioBtn.addEventListener("click", addSelectedMunicipio);
  municipioInput.addEventListener("keydown", handleMunicipioKeydown);
  municipioChips.addEventListener("click", removeSelectedMunicipio);
  addComunidadeTradicionalBtn.addEventListener("click", addSelectedComunidadeTradicional);
  comunidadeTradicionalInput.addEventListener("keydown", handleComunidadeTradicionalKeydown);
  comunidadeTradicionalChips.addEventListener("click", removeSelectedComunidadeTradicional);
  processList.addEventListener("click", handleProcessosAnalisadosClick);
  addAldeiaBtn.addEventListener("click", () => addAldeiaField());
  aldeiaInput.addEventListener("keydown", handleAldeiaKeydown);
  aldeiaChips.addEventListener("click", removeAldeiaField);
  documentosTableBody.addEventListener("click", handleDocumentoTableClick);
  document.addEventListener("click", handleInfoToggleClick);
  coordenadasTableBody.addEventListener("click", handleCoordenadaTableClick);
  coordenadasTableBody.addEventListener("input", handleCoordenadaTableInput);
  mapasTableBody.addEventListener("click", handleMapaTableClick);
  prevBtn.addEventListener("click", goToPreviousStep);
  nextBtn.addEventListener("click", goToNextStep);
  saveDraftBtn.addEventListener("click", salvarRascunho);
  savePdfBtn.addEventListener("click", salvarPdf);
  homeBtn.addEventListener("click", confirmReturnHome);
}

function handleFormChange() {
  clearMessage();
  updateConditionals();
  clearResolvedValidationErrors();
}

function handleDateMaskInput(event) {
  const field = event.target;
  if (!field || field.tagName !== "INPUT" || field.type !== "text") return;
  if (!DATE_BR_FIELD_NAMES.has(field.name)) return;

  field.value = formatDateInputValue(field.value);
}

function formatDateInputValue(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function handleInfoToggleClick(event) {
  const button = event.target.closest(".info-icon");
  if (!button) return;

  const label = button.closest(".table-info-label");
  const text = label?.querySelector(".info-text");
  if (!text) return;

  const isVisible = text.classList.toggle("is-visible");
  button.setAttribute("aria-expanded", String(isVisible));
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
  submitBtn.hidden = activeFormMode === "sent" || currentStep !== steps.length - 1;
  saveDraftBtn.hidden = activeFormMode === "sent";
  savePdfBtn.hidden = activeFormMode !== "sent";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setFormViewMode(mode = "edit") {
  const isSentView = mode === "sent";
  formApp.dataset.mode = mode;
  form.querySelectorAll("input, select, textarea").forEach((field) => {
    if (field.name === "consultorEmail") {
      field.readOnly = true;
      return;
    }

    field.disabled = isSentView;
  });
}

function goToNextStep() {
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
  setConditional("numeroSeiQualificacaoWrap", getValue("temRoteiro") === "Sim");
  setConditional("outraEtniaWrap", selectedEtnias.includes("Outros"));
  if (getValue("temRoteiro") === "Sim" && !getValue("dataRoteiro")) {
    form.elements.dataRoteiro.value = converterDataParaBR(getTodayDate());
  }
  setConditional("judicializadoDetalhes", getValue("estaJudicializado") === "Sim");
  setConditional("decisaoDetalhes", getValue("temDecisao") === "Sim");
  setConditional("classificacaoJudicializacaoOutrosWrap", getValue("classificacaoJudicializacao") === "Outros");
  setConditional("coordenadasWrap", getValue("temCoordenadas") === "Sim");
  setConditional("mapasCartograficosWrap", getValue("temMapaCartografico") === "Sim");
  setConditional("sobreposicoesWrap", getValue("sobreposicoes") === "Sim");
  setConditional("aldeiasComunidadesWrap", getValue("citaAldeiasComunidades") === "Sim");
  setConditional("indigenasAreaWrap", getValue("indigenasArea") === "Sim");
  setConditional("comunidadesTradicionaisWrap", getValue("comunidadesTradicionais") === "Sim");
  setConditional("outrasComunidadesTradicionaisWrap", selectedComunidadesTradicionais.includes("Outros"));
  setConditional("conflitoInteretnicoWrap", getValue("conflitoInteretnico") === "Sim");
  setConditional("outroTipoConflitoWrap", getValue("conflitoInteretnico") === "Sim" && getCheckedValues("tiposConflito").includes("Outro"));
  setConditional("reintegracaoPosseWrap", getValue("reintegracaoPosse") === "Sim");
  setConditional("outrasAcoesJudiciaisComunidadeWrap", getValue("outrasAcoesJudiciaisComunidade") === "Sim");
  setConditional("detalhesRetomadaWrap", getValue("temRetomada") === "Sim");
  setConditional("descricaoAcaoWrap", getCheckedValues("acoesJudiciais").includes("Outros"));
  setConditional("outroVulnerabilidadeWrap", getCheckedValues("vulnerabilidades").includes("Outros"));
  updateVulnerabilityDetails();
  updateCoordinateFormatDetails();

  const demandas = getCheckedValues("tipoDemanda");
  setConditional("modalidadeReservaWrap", hasDemand(demandas, "Reserva Indígena"));
  setConditional("justificativaRevisaoWrap", hasDemand(demandas, "Revisão de limites"));
  setConditional("justificativaRevisaoTextoWrap", hasDemand(demandas, "Revisão de limites") && getValue("temJustificativaRevisao") === "Sim");
}

function setConditional(id, isVisible, requiredNames = []) {
  const element = document.getElementById(id);
  if (!element) return;

  element.classList.toggle("is-visible", isVisible);
  element.querySelectorAll("input, select, textarea").forEach((field) => {
    if (!isVisible) {
      field.classList.remove("invalid");
      clearFieldError(field.name);
      if (requiredNames.includes(field.name)) field.required = false;
      return;
    }

    if (requiredNames.includes(field.name)) field.required = true;
  });
}

function validateCurrentStep() {
  return validateRequiredFields(true).length === 0;
}

function validateRequiredFields(isDraftSave = false) {
  clearValidationErrors();
  if (isDraftSave) return [];

  updateConditionals();
  const errors = [];
  const demandas = getCheckedValues("tipoDemanda");
  const requiredRules = [
    { fieldId: "consultorNome", label: "Nome completo do(a) consultor(a)", isValid: () => hasValue("consultorNome") },
    { fieldId: "areaEstudo", label: "Área de estudo", isValid: () => hasValue("areaEstudo") },
    { fieldId: "reivindicacaoId", label: "ID", isValid: () => hasValue("reivindicacaoId") },
    { fieldId: "nomeReivindicacao", label: "Nome da reivindicação", isValid: () => hasValue("nomeReivindicacao") },
    { fieldId: "outrosNomesTexto", label: "Outros nomes da reivindicação", isValid: () => getValue("outrosNomes") !== "Sim" || hasValue("outrosNomesTexto") },
    { fieldId: "temRoteiro", label: "Tem roteiro", isValid: () => hasChecked("temRoteiro") },
    { fieldId: "dataRoteiro", label: "Data do roteiro", isValid: () => getValue("temRoteiro") !== "Sim" || hasValue("dataRoteiro") },
    { fieldId: "etnias", label: "Etnia", isValid: () => selectedEtnias.length > 0 },
    { fieldId: "outraEtnia", label: "Outra etnia", isValid: () => !selectedEtnias.includes("Outros") || selectedOutrasEtnias.length > 0 },
    { fieldId: "tipoDemanda", label: "Tipo da demanda", isValid: () => demandas.length > 0 },
    { fieldId: "modalidadeConstituicao", label: "Modalidade de Constituição", isValid: () => !hasDemand(demandas, "Reserva Indígena") || hasValue("modalidadeConstituicao") },
    { fieldId: "temJustificativaRevisao", label: "Há justificativa para a demanda por revisão de limites", isValid: () => !hasDemand(demandas, "Revisão de limites") || hasChecked("temJustificativaRevisao") },
    { fieldId: "justificativaRevisao", label: "Justificativa da Revisão", isValid: () => getValue("temJustificativaRevisao") !== "Sim" || hasValue("justificativaRevisao") },
    { fieldId: "estados", label: "Estado", isValid: () => selectedEstados.length > 0 },
    { fieldId: "municipios", label: "Município", isValid: () => selectedMunicipios.length > 0 },
    { fieldId: "coordenacaoRegional", label: "Coordenação Regional", isValid: () => hasValue("coordenacaoRegional") },
    { fieldId: "temRetomada", label: "Tem retomada", isValid: () => hasChecked("temRetomada") },
    { fieldId: "detalhesRetomada", label: "Detalhes da retomada", isValid: () => getValue("temRetomada") !== "Sim" || hasValue("detalhesRetomada") },
    { fieldId: "descricaoAcao", label: "Descrição da ação judicial", isValid: () => !getCheckedValues("acoesJudiciais").includes("Outros") || hasValue("descricaoAcao") },
    { fieldId: "detalheOutrasSobreposicoes", label: "Detalhe de outras sobreposições", isValid: () => !getCheckedValues("tiposSobreposicao").includes("Outros") || hasValue("detalheOutrasSobreposicoes") },
    { fieldId: "descricaoReivindicacao", label: "Descrição da reivindicação", isValid: () => hasValue("descricaoReivindicacao") },
    { fieldId: "outroCriterioVulnerabilidade", label: "Outro critério de vulnerabilidade", isValid: () => !getCheckedValues("vulnerabilidades").includes("Outros") || hasValue("outroCriterioVulnerabilidade") },
    { fieldId: "descricaoComunidadeTradicional", label: "Outra comunidade tradicional", isValid: () => !selectedComunidadesTradicionais.includes("Outros") || hasValue("descricaoComunidadeTradicional") },
    { fieldId: "outroTipoConflito", label: "Outro tipo de conflito", isValid: () => !getCheckedValues("tiposConflito").includes("Outro") || hasValue("outroTipoConflito") },
    { fieldId: "coordenadas", label: "Coordenadas geográficas", isValid: () => areCoordenadasValid() }
  ];

  requiredRules.forEach((rule) => {
    if (rule.isValid()) return;
    const error = showFieldError(rule.fieldId, "Campo obrigatório");
    errors.push({
      fieldId: rule.fieldId,
      label: rule.label,
      stepIndex: error.stepIndex,
      target: error.target
    });
  });

  return errors;
}

function clearValidationErrors() {
  form.querySelectorAll(".field-error, [data-error-field]").forEach((element) => {
    element.classList.remove("field-error");
    delete element.dataset.errorField;
  });
  form.querySelectorAll(".field-error-message").forEach((element) => element.remove());
}

function clearResolvedValidationErrors() {
  const activeErrors = Array.from(form.querySelectorAll("[data-error-field]"));
  activeErrors.forEach((element) => {
    const fieldId = element.dataset.errorField;
    if (!isRequiredFieldResolved(fieldId)) return;
    clearFieldError(fieldId);
  });
}

function showFieldError(fieldId, message) {
  const target = getFieldErrorTarget(fieldId);
  const container = target?.container || target?.control;
  const control = target?.control;
  const step = container?.closest(".step") || control?.closest(".step");
  const stepIndex = steps.indexOf(step);

  if (container) {
    container.classList.add("field-error");
    container.dataset.errorField = fieldId;
  }

  if (control) {
    control.classList.add("field-error");
    control.dataset.errorField = fieldId;
  }

  if (container && !container.querySelector(`.field-error-message[data-error-for="${fieldId}"]`)) {
    const errorMessage = document.createElement("small");
    errorMessage.className = "field-error-message";
    errorMessage.dataset.errorFor = fieldId;
    errorMessage.textContent = message;
    container.append(errorMessage);
  }

  return {
    target: container || control,
    stepIndex: stepIndex >= 0 ? stepIndex : 0
  };
}

function goToFirstErrorStep(errors) {
  if (!errors.length) return;

  const [firstError] = errors;
  showStep(firstError.stepIndex);
  setTimeout(() => {
    const target = getFieldErrorTarget(firstError.fieldId)?.container || firstError.target;
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 80);
}

function clearFieldError(fieldId) {
  form.querySelectorAll(`[data-error-field="${fieldId}"]`).forEach((element) => {
    element.classList.remove("field-error");
    delete element.dataset.errorField;
  });
  form.querySelectorAll(`.field-error-message[data-error-for="${fieldId}"]`).forEach((element) => element.remove());
}

function getFieldErrorTarget(fieldId) {
  const customTargets = {
    etnias: () => ({ container: etniaInput.closest(".multi-autocomplete"), control: etniaInput }),
    outraEtnia: () => ({ container: document.querySelector("#outraEtniaWrap"), control: outraEtniaInput }),
    estados: () => ({ container: estadoInput.closest(".multi-autocomplete"), control: estadoInput }),
    municipios: () => ({ container: municipioInput.closest(".multi-autocomplete"), control: municipioInput }),
    coordenadas: () => {
      const section = document.querySelector("#coordenadasWrap");
      return { container: section, control: section?.querySelector(".coordinate-table") };
    },
    tipoDemanda: () => {
      const group = form.querySelector("[data-required-group='tipoDemanda']");
      return { container: group?.closest("fieldset") || group, control: group };
    }
  };

  if (customTargets[fieldId]) return customTargets[fieldId]();

  const element = form.elements[fieldId];
  if (!element) return {};
  const controls = element instanceof RadioNodeList ? Array.from(element) : [element];
  const firstControl = controls[0];
  const isGroup = firstControl?.type === "radio" || firstControl?.type === "checkbox";
  const container = isGroup ? firstControl.closest("fieldset") : firstControl.closest("label, fieldset, .multi-autocomplete");

  return {
    container,
    control: isGroup ? container?.querySelector(".check-grid") || container : firstControl
  };
}

function isRequiredFieldResolved(fieldId) {
  const demandas = getCheckedValues("tipoDemanda");
  const resolved = {
    consultorNome: () => hasValue("consultorNome"),
    areaEstudo: () => hasValue("areaEstudo"),
    reivindicacaoId: () => hasValue("reivindicacaoId"),
    nomeReivindicacao: () => hasValue("nomeReivindicacao"),
    outrosNomesTexto: () => getValue("outrosNomes") !== "Sim" || hasValue("outrosNomesTexto"),
    temRoteiro: () => hasChecked("temRoteiro"),
    dataRoteiro: () => getValue("temRoteiro") !== "Sim" || hasValue("dataRoteiro"),
    etnias: () => selectedEtnias.length > 0,
    outraEtnia: () => !selectedEtnias.includes("Outros") || selectedOutrasEtnias.length > 0,
    tipoDemanda: () => demandas.length > 0,
    modalidadeConstituicao: () => !hasDemand(demandas, "Reserva Indígena") || hasValue("modalidadeConstituicao"),
    temJustificativaRevisao: () => !hasDemand(demandas, "Revisão de limites") || hasChecked("temJustificativaRevisao"),
    justificativaRevisao: () => getValue("temJustificativaRevisao") !== "Sim" || hasValue("justificativaRevisao"),
    estados: () => selectedEstados.length > 0,
    municipios: () => selectedMunicipios.length > 0,
    coordenacaoRegional: () => hasValue("coordenacaoRegional"),
    temRetomada: () => hasChecked("temRetomada"),
    detalhesRetomada: () => getValue("temRetomada") !== "Sim" || hasValue("detalhesRetomada"),
    descricaoReivindicacao: () => hasValue("descricaoReivindicacao"),
    coordenadas: () => areCoordenadasValid()
  };

  return resolved[fieldId]?.() ?? true;
}

function hasValue(name) {
  return Boolean(getValue(name));
}

function hasChecked(name) {
  return getCheckedValues(name).length > 0;
}

function hasDemand(demandas, value) {
  const normalizedValue = normalizeText(value);
  return demandas.some((demanda) => {
    const normalizedDemand = normalizeText(demanda);
    if (normalizedValue.includes("reserva")) return normalizedDemand.includes("reserva");
    if (normalizedValue.includes("revisao")) return normalizedDemand.includes("revis");
    return normalizedDemand === normalizedValue;
  });
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

async function enviarFormulario(event) {
  event.preventDefault();
  const isDraftSave = false;
  const validationErrors = validateRequiredFields(isDraftSave);
  if (validationErrors.length) {
    showMessage(`Existem campos obrigatórios não preenchidos. Revise os campos destacados em vermelho. Campos: ${validationErrors.map((error) => error.label).join(", ")}.`, "error");
    goToFirstErrorStep(validationErrors);
    return;
  }

  const authorizedEmail = getStoredAuthorizedEmail();
  if (!authorizedEmail || !hasActiveSession()) {
    showAccessScreen();
    showAccessMessage("Informe seu e-mail para acessar o formulário.", "error");
    return;
  }

  setAuthorizedEmail(authorizedEmail);

  await salvarFormulario("Enviado");
}

async function handleSubmit(event) {
  return enviarFormulario(event);
}

function buildPayload(statusFormulario = "Enviado") {
  const now = new Date().toISOString();
  const formularioJson = montarFormularioJson(statusFormulario, now);
  const payload = {
    ...formularioJson,
    formularioJson: JSON.stringify(formularioJson)
  };
  return garantirTiposPayload(payload);
}

function garantirTiposPayload(payload) {
  const normalizado = {
    ...payload,
    formularioJson: normalizarTextoParaPowerAutomate(payload.formularioJson),
    consultor: garantirObjeto(payload.consultor),
    reivindicacao: garantirObjeto(payload.reivindicacao),
    resumoProcesso: garantirObjeto(payload.resumoProcesso),
    statusProcesso: garantirObjeto(payload.statusProcesso),
    caracterizacaoArea: garantirObjeto(payload.caracterizacaoArea),
    ocupacaoIndigena: garantirObjeto(payload.ocupacaoIndigena)
  };

  normalizado.reivindicacao.processosAnalisados = garantirArray(normalizado.reivindicacao.processosAnalisados);
  normalizado.resumoProcesso.documentos = garantirArray(normalizado.resumoProcesso.documentos);
  normalizado.caracterizacaoArea.coordenadas = garantirArray(normalizado.caracterizacaoArea.coordenadas);
  normalizado.caracterizacaoArea.coordenadasDetalhadas = garantirArray(normalizado.caracterizacaoArea.coordenadasDetalhadas);
  normalizado.caracterizacaoArea.mapasCartograficos = garantirArray(normalizado.caracterizacaoArea.mapasCartograficos);
  normalizado.ocupacaoIndigena.detalhesVulnerabilidades = garantirArray(normalizado.ocupacaoIndigena.detalhesVulnerabilidades);
  normalizado.ocupacaoIndigena.detalhesComunidadesTradicionais = garantirArray(normalizado.ocupacaoIndigena.detalhesComunidadesTradicionais);

  ["detalhesDecisao", "motivacaoJudicializacao", "detalhesJudicializacao"].forEach((campo) => {
    const valor = normalizado.statusProcesso[campo];
    if (valor && typeof valor === "object") {
      normalizado.statusProcesso[campo] = JSON.stringify(valor);
    }
  });

  return normalizado;
}

function garantirObjeto(valor) {
  return valor && typeof valor === "object" && !Array.isArray(valor) ? valor : {};
}

function garantirArray(valor) {
  return Array.isArray(valor) ? valor : [];
}

function montarFormularioJson(statusFormulario = "Rascunho", now = new Date().toISOString()) {
  const etnias = asList(getSelectedEtnias());
  const outrasEtnias = asList(getSelectedOutrasEtnias());
  const estados = asList(getSelectedEstados());
  const municipios = asList(getSelectedMunicipios());
  const documentos = asList(getDocumentosProcesso());
  const primeiroDocumento = documentos[0] || {};
  const coordenadasDetalhadas = asList(getCoordenadasDetalhadas());
  const coordenadas = asList(getCoordenadasGeograficas());
  const primeiraCoordenada = coordenadasDetalhadas[0] || {};
  const mapasCartograficos = asList(getMapasCartograficos());
  const processosAnalisados = asList(getProcessosAnalisados());

  return {
    formularioId: asText(getCurrentFormularioId()),
    tokenSecreto: asText(SECRET_TOKEN),
    statusFormulario: asText(statusFormulario),
    atualizadoEm: asText(now),
    enviadoEm: statusFormulario === "Enviado" ? asText(now) : "",
    origem: "github-pages-funai",
    etapaAtual: currentStep,
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
      processosAnalisados,
      temRoteiro: asText(getValue("temRoteiro")),
      dataRoteiro: converterDataParaISO(getValue("dataRoteiro")),
      numeroSeiQualificacao: asText(getValue("numeroSeiQualificacao")),
      etnias,
      outraEtnia: asText(outrasEtnias.join(", ")),
      outrasEtnias,
      tipoDemanda: asList(getCheckedValues("tipoDemanda")),
      modalidadeConstituicao: asText(getValue("modalidadeConstituicao")),
      temJustificativaRevisao: asText(getValue("temJustificativaRevisao")),
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
      documentos,
      dataDocumento: asText(primeiroDocumento.dataDocumento),
      tipoDocumento: asText(primeiroDocumento.tipoDocumento),
      paginas: asText(primeiroDocumento.paginasDocumento),
      paginasDocumento: asText(primeiroDocumento.paginasDocumento),
      numeroSei: asText(primeiroDocumento.numeroSei),
      eventosAssuntos: asText(primeiroDocumento.eventosAssuntos),
      numeroProcessoDocumento: asText(primeiroDocumento.numeroProcessoDocumento)
    },
    statusProcesso: {
      estaJudicializado: asText(getValue("estaJudicializado")),
      motivacaoJudicializacao: asText(getValue("motivacaoJudicializacao")),
      classificacaoJudicializacao: asText(getValue("classificacaoJudicializacao")),
      classificacaoJudicializacaoOutros: asText(getValue("classificacaoJudicializacaoOutros")),
      acoesJudiciais: asList(getCheckedValues("acoesJudiciais")),
      descricaoAcao: asText(getValue("descricaoAcao")),
      parteAutoraAcao: asText(getValue("parteAutoraAcao")),
      numeroProcessoSeiJudicial: asText(getValue("numeroProcessoSeiJudicial")),
      numeroAcaoJudicial: asText(getValue("numeroAcaoJudicial")),
      dataAcaoJudicial: converterDataParaISO(getValue("dataAcaoJudicial")),
      detalhesJudicializacao: asText(getValue("detalhesJudicializacao")),
      temDecisao: asText(getValue("temDecisao")),
      numeroDecisao: asText(getValue("numeroDecisao")),
      dataDecisao: converterDataParaISO(getValue("dataDecisao")),
      sentenca: asText(getValue("sentenca")),
      detalhesDecisao: asText(getValue("detalhesDecisao")),
      numeroProcessoJudicial: asText(getValue("numeroProcessoJudicial"))
    },
    caracterizacaoArea: {
      localizacaoDemanda: asText(getValue("localizacaoDemanda")),
      temCoordenadas: asText(getValue("temCoordenadas")),
      coordenadas,
      coordenadasDetalhadas,
      latitude: asText(primeiraCoordenada.latitude),
      tipoCoordenada: asText(primeiraCoordenada.tipoCoordenada),
      outroFormatoCoordenada: asText(primeiraCoordenada.outroFormatoCoordenada),
      latitudeDirecao: asText(primeiraCoordenada.latitudeDirecao),
      longitude: asText(primeiraCoordenada.longitude),
      longitudeDirecao: asText(primeiraCoordenada.longitudeDirecao),
      coordenadaSedeMunicipio: asText(primeiraCoordenada.coordenadaSedeMunicipio),
      comentarioCoordenada: asText(primeiraCoordenada.comentarioCoordenada),
      temMapaCartografico: asText(getValue("temMapaCartografico")),
      mapasCartograficos,
      bioma: asList(getCheckedValues("bioma")),
      citaAldeiasComunidades: asText(getValue("citaAldeiasComunidades")),
      aldeiasComunidades: asText(getAldeiasComunidades().join(", ")),
      aldeiasComunidadesLista: asList(getAldeiasComunidades()),
      contextoUrbano: asText(getValue("contextoUrbano")),
      faixaFronteira: asText(getValue("faixaFronteira")),
      temRetomada: asText(getValue("temRetomada")),
      detalhesRetomada: asText(getValue("detalhesRetomada")),
      sobreposicoes: asText(getValue("sobreposicoes")),
      tiposSobreposicao: asList(getCheckedValues("tiposSobreposicao")),
      detalheUcFederal: asText(getValue("detalheUcFederal")),
      detalheUcEstadual: asText(getValue("detalheUcEstadual")),
      detalheUcMunicipal: asText(getValue("detalheUcMunicipal")),
      detalheGlebaFederal: asText(getValue("detalheGlebaFederal")),
      detalheGlebaEstadual: asText(getValue("detalheGlebaEstadual")),
      detalheTerritorioQuilombola: asText(getValue("detalheTerritorioQuilombola")),
      detalheProjetoAssentamento: asText(getValue("detalheProjetoAssentamento")),
      detalheProjetoAssentamentoAgroextrativista: asText(getValue("detalheProjetoAssentamentoAgroextrativista")),
      detalheProjetoDesenvolvimentoSustentavel: asText(getValue("detalheProjetoDesenvolvimentoSustentavel")),
      detalheProjetoAssentamentoFlorestal: asText(getValue("detalheProjetoAssentamentoFlorestal")),
      detalheOutrasSobreposicoes: asText(getValue("detalheOutrasSobreposicoes"))
    },
    ocupacaoIndigena: {
      indigenasArea: asText(getValue("indigenasArea")),
      tempoOcupacao: asText(getValue("tempoOcupacao")),
      dataReferenciaOcupacao: asText(getValue("dataReferenciaOcupacao")),
      vulnerabilidades: asList(getCheckedValues("vulnerabilidades")),
      outroCriterioVulnerabilidade: asText(getValue("outroCriterioVulnerabilidade")),
      detalhesVulnerabilidades: asList(getDetalhesVulnerabilidades()),
      fonteVulnerabilidade: asText(getValue("fonteVulnerabilidade")),
      dataReferenciaVulnerabilidade: asText(getValue("dataReferenciaVulnerabilidade")),
      comunidadesTradicionais: asText(getValue("comunidadesTradicionais")),
      tiposComunidadeTradicional: asList(getSelectedComunidadesTradicionais()),
      detalhesComunidadesTradicionais: asList(getDetalhesComunidadesTradicionais()),
      descricaoComunidadeTradicional: asText(getValue("descricaoComunidadeTradicional")),
      dataReferenciaComunidadeTradicional: asText(getPrimeiroDetalheComunidadeTradicional().dataReferencia),
      conflitoInteretnico: asText(getValue("conflitoInteretnico")),
      tiposConflito: asList(getCheckedValues("tiposConflito")),
      outroTipoConflito: asText(getValue("outroTipoConflito")),
      envolvidosConflito: asText(getValue("envolvidosConflito")),
      motivoConflitoInteretnico: asText(getValue("motivoConflitoInteretnico")),
      etniaConflitoInteretnico: asText(getValue("etniaConflitoInteretnico")),
      dataReferenciaConflitoInteretnico: asText(getValue("dataReferenciaConflitoInteretnico")),
      fonteConflito: asText(getValue("fonteConflito")),
      reintegracaoPosse: asText(getValue("reintegracaoPosse")),
      descricaoReintegracaoPosse: asText(getValue("descricaoReintegracaoPosse")),
      outrasAcoesJudiciaisComunidade: asText(getValue("outrasAcoesJudiciaisComunidade")),
      descricaoOutrasAcoesJudiciaisComunidade: asText(getValue("descricaoOutrasAcoesJudiciaisComunidade")),
      informacoesAdicionais: asText(getValue("informacoesAdicionais"))
    }
  };
}

async function salvarRascunho() {
  const isDraftSave = true;
  validateRequiredFields(isDraftSave);
  await salvarFormulario("Rascunho");
}

async function salvarFormulario(statusFormulario = "Rascunho") {
  const isDraft = statusFormulario === "Rascunho";
  const actionButton = isDraft ? saveDraftBtn : submitBtn;
  const defaultText = isDraft ? "Salvar Rascunho" : "Enviar formulário";
  const loadingText = isDraft ? "Salvando..." : "Enviando...";

  if (actionButton.disabled) return;

  if (!POWER_AUTOMATE_URL) {
    showMessage("Configure POWER_AUTOMATE_URL no arquivo js/config.js antes de salvar.", "error");
    return;
  }

  const isUpdate = activePersistenceMode === "update";
  const payload = normalizarPayloadParaPowerAutomate(buildPayload(statusFormulario));
  console.log(isUpdate ? "modo update" : "modo create");
  console.log("payload enviado", payload);
  console.log("payload normalizado", payload);
  console.log("TIPOS DO PAYLOAD", {
    consultor: typeof payload.consultor,
    reivindicacao: typeof payload.reivindicacao,
    etniasEhArray: Array.isArray(payload.reivindicacao?.etnias),
    tipoDemandaEhArray: Array.isArray(payload.reivindicacao?.tipoDemanda),
    mapasEhArray: Array.isArray(payload.caracterizacaoArea?.mapasCartograficos)
  });
  console.log("DEBUG TIPOS COMPLETO", {
    formularioJson: typeof payload.formularioJson,

    consultor: typeof payload.consultor,
    reivindicacao: typeof payload.reivindicacao,
    resumoProcesso: typeof payload.resumoProcesso,
    statusProcesso: typeof payload.statusProcesso,
    caracterizacaoArea: typeof payload.caracterizacaoArea,
    ocupacaoIndigena: typeof payload.ocupacaoIndigena,

    processosAnalisadosEhArray: Array.isArray(payload.reivindicacao?.processosAnalisados),
    documentosEhArray: Array.isArray(payload.resumoProcesso?.documentos),
    coordenadasEhArray: Array.isArray(payload.caracterizacaoArea?.coordenadas),
    coordenadasDetalhadasEhArray: Array.isArray(payload.caracterizacaoArea?.coordenadasDetalhadas),
    mapasCartograficosEhArray: Array.isArray(payload.caracterizacaoArea?.mapasCartograficos),
    detalhesVulnerabilidadesEhArray: Array.isArray(payload.ocupacaoIndigena?.detalhesVulnerabilidades),
    detalhesComunidadesEhArray: Array.isArray(payload.ocupacaoIndigena?.detalhesComunidadesTradicionais),

    detalhesDecisao: {
      tipo: typeof payload.statusProcesso?.detalhesDecisao,
      valor: payload.statusProcesso?.detalhesDecisao
    },
    motivacaoJudicializacao: {
      tipo: typeof payload.statusProcesso?.motivacaoJudicializacao,
      valor: payload.statusProcesso?.motivacaoJudicializacao
    }
  });

  saveDraftBtn.disabled = true;
  submitBtn.disabled = true;
  actionButton.textContent = loadingText;

  try {
    console.log("payload enviado", payload);

    console.log(
      "FormularioJson parseado",
      JSON.parse(payload.formularioJson)
    );

    console.log(
      "mapasCartograficos",
      JSON.parse(payload.formularioJson).caracterizacaoArea.mapasCartograficos
    );

    console.log(
      "outrasAcoesJudiciaisComunidade",
      JSON.parse(payload.formularioJson).ocupacaoIndigena.outrasAcoesJudiciaisComunidade
    );

    console.log(
      "descricaoOutrasAcoesJudiciaisComunidade",
      JSON.parse(payload.formularioJson).ocupacaoIndigena.descricaoOutrasAcoesJudiciaisComunidade
    );

    console.log(
      "processosAnalisados",
      JSON.parse(payload.formularioJson).reivindicacao.processosAnalisados
    );

    const response = await fetch(POWER_AUTOMATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    console.log(response.status, response.statusText);

    if (response.ok) {
      activePersistenceMode = "update";
      sessionStorage.setItem(ACTIVE_FORM_ID_KEY, payload.formularioId);

      if (!isDraft) {
        showMessage("Formulário enviado com sucesso.", "success");
        sessionStorage.removeItem(ACTIVE_FORM_ID_KEY);
        showDashboard(getAuthorizedEmail());
        return;
      }

      showMessage(isUpdate ? "Rascunho atualizado no SharePoint." : "Rascunho criado no SharePoint.", "success");
      return;
    }

    await readJsonIfAvailable(response);

    if (response.status === 403) {
      showMessage(isDraft ? "Este e-mail não está autorizado." : "Este e-mail não está autorizado a enviar o formulário.", "error");
      return;
    }

    throw new Error(`Falha no envio: ${response.status}`);
  } catch (error) {
    showMessage(isDraft ? "Erro ao salvar rascunho no SharePoint." : "Não foi possível enviar o formulário. Verifique a URL do Power Automate e tente novamente.", "error");
  } finally {
    saveDraftBtn.disabled = false;
    submitBtn.disabled = false;
    actionButton.textContent = defaultText;
  }
}

function salvarPdf() {
  updateConditionals();
  window.print();
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
    mode: "draft",
    email
  });
}

async function listarEnviados() {
  await listarRelatorios({
    title: "Relatorios enviados",
    url: LIST_SENT_URL,
    emptyMessage: "Nenhum relatorio enviado encontrado.",
    mode: "sent"
  });
}

async function listarRelatorios({ title, url, emptyMessage, mode = "draft", email = getAuthorizedEmail() }) {
  currentReportListMode = mode;
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
  return abrirRelatorio(formularioId, "draft");
}

async function abrirRelatorioEnviado(formularioId) {
  return abrirRelatorio(formularioId, "sent");
}

async function abrirRelatorio(formularioId, mode = "draft") {
  return carregarFormulario(formularioId, mode);
}

async function carregarFormulario(formularioId, mode = "draft") {
  const resumo = getCachedReport(formularioId);
  if (!resumo) {
    showReportListMessage("Relatorio nao encontrado nesta lista.", "error");
    return;
  }

  const id = getReportFormularioId(resumo) || asText(formularioId);
  if (!LOAD_DRAFT_URL) {
    showReportListMessage("Configure LOAD_DRAFT_URL no arquivo js/config.js.", "error");
    return;
  }

  try {
    showReportListMessage(mode === "sent" ? "Carregando relatorio enviado..." : "Carregando rascunho...", "success");
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

    if (!response.ok) throw new Error(`Falha ao carregar relatorio: ${response.status}`);

    const data = await readJsonIfAvailable(response);
    console.log("rascunho carregado", data);
    const relatorio = normalizarRascunhoCarregado(data, resumo);
    console.log(mode === "sent" ? "relatorio enviado carregado" : "rascunho carregado", relatorio);

    currentFormularioId = getReportFormularioId(relatorio) || id;
    sessionStorage.setItem(ACTIVE_FORM_ID_KEY, currentFormularioId);
    activePersistenceMode = "update";
    await openForm({ reset: true, mode: mode === "sent" ? "sent" : "edit" });
    preencherFormulario(relatorio);
    setFormViewMode(mode === "sent" ? "sent" : "edit");
    updateConditionals();
    showStep(getFormularioStep(relatorio));
  } catch (error) {
    showReportListMessage("Nao foi possivel abrir o relatorio.", "error");
  }
}

function normalizarRascunhoCarregado(data, fallback) {
  if (Array.isArray(data)) return data[0] || fallback;
  if (data?.relatorio) return data.relatorio;
  if (data?.rascunho) return data.rascunho;
  if (data?.item) return data.item;
  if (Array.isArray(data?.value)) return data.value[0] || fallback;
  if (data?.value && !Array.isArray(data.value)) return data.value;
  return data || fallback;
}

async function carregarRelatorio(id) {
  return abrirRelatorio(id, currentReportListMode);
}

function preencherFormulario(dados) {
  const formularioId = getReportFormularioId(dados);
  if (formularioId) {
    currentFormularioId = formularioId;
    sessionStorage.setItem(ACTIVE_FORM_ID_KEY, currentFormularioId);
    activePersistenceMode = "update";
  }

  const formularioJson = extrairFormularioJson(dados);
  if (formularioJson) {
    preencherFormularioPorJson(formularioJson);
  } else {
    restoreValues(flattenDraft(dados));
  }
  setAuthorizedEmail(getAuthorizedEmail());
}

function preencherFormularioPorJson(dados) {
  if (!dados || typeof dados !== "object") return;
  const formularioId = getReportFormularioId(dados);
  if (formularioId) {
    currentFormularioId = formularioId;
    sessionStorage.setItem(ACTIVE_FORM_ID_KEY, currentFormularioId);
    activePersistenceMode = "update";
  }

  restoreValues(flattenDraft(dados));
  updateConditionals();
}

function extrairFormularioJson(item) {
  const raw = item?.FormularioJson || item?.formularioJson;
  if (!raw) return null;
  if (typeof raw === "object") return raw;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("FormularioJson invalido.", error);
    return null;
  }
}

function getFormularioStep(item) {
  const formularioJson = extrairFormularioJson(item) || item;
  const step = Number(formularioJson?.etapaAtual);
  if (!Number.isInteger(step)) return 0;
  return Math.min(Math.max(step, 0), Math.max(steps.length - 1, 0));
}

/* antigo fluxo local mantido como alias de compatibilidade */
async function carregarRelatorioLocal(formularioId) {
  const relatorio = getCachedReport(formularioId);
  if (!relatorio) return;

  currentFormularioId = getReportFormularioId(relatorio) || asText(formularioId);
  sessionStorage.setItem(ACTIVE_FORM_ID_KEY, currentFormularioId);
  await openForm({ reset: true, mode: "edit" });
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
    idButton.addEventListener("click", () => {
      if (currentReportListMode === "sent") {
        abrirRelatorioEnviado(formularioId);
        return;
      }

      abrirRascunho(formularioId);
    });
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
  const formularioJson = extrairFormularioJson(relatorio);
  return asText(relatorio.formularioId || relatorio.FormularioId || relatorio.id || relatorio.ID || formularioJson?.formularioId);
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
  const outrasEtnias = asListOrSplit(values.outrasEtnias || values.outraEtnia);
  const estados = asListOrSplit(values.estados);
  const municipios = asListOrSplit(values.municipios);
  const comunidadesTradicionais = asListOrSplit(values.tiposComunidadeTradicional);
  const processosAnalisados = normalizarProcessosAnalisados(values.processosAnalisados, values.numerosProcesso, values.descricaoProcessosAnalisados);
  const aldeiasComunidadesLista = asListOrSplit(values.aldeiasComunidadesLista || values.aldeiasComunidades);

  if (etnias.length) {
    selectedEtnias = etnias;
    renderEtniaChips();
  }

  if (outrasEtnias.length) {
    selectedOutrasEtnias = outrasEtnias;
    renderOutraEtniaChips();
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

  if (comunidadesTradicionais.length) {
    selectedComunidadesTradicionais = comunidadesTradicionais;
    renderComunidadeTradicionalChips();
    populateComunidadeTradicionalOptions();
  }

  carregarProcessosAnalisados(processosAnalisados);

  if (aldeiasComunidadesLista.length) {
    restoreAldeiaFields(aldeiasComunidadesLista);
  }

  const documentos = asList(values.documentos);
  restoreDocumentoRows(documentos);
  if (!documentos.length) restoreLegacyDocumentoRow(values);
  const coordenadas = asList(values.coordenadasDetalhadas || values.coordenadas);
  restoreCoordenadaRows(coordenadas);
  if (!coordenadas.length) restoreLegacyCoordenadaRow(values);
  restoreMapaRows(values.mapasCartograficos);
  restoreDetalhesVulnerabilidades(values.detalhesVulnerabilidades);
  renderComunidadeTradicionalDetalhes(values.detalhesComunidadesTradicionais);

  Object.entries(values).forEach(([name, value]) => {
    if (["etnias", "outrasEtnias", "outraEtnia", "estados", "municipios", "tiposComunidadeTradicional", "detalhesComunidadesTradicionais", "processosAnalisados", "numerosProcesso", "descricaoProcessosAnalisados", "numeroSeiProcessoAnalisado", "descricaoProcessoAnalisado", "aldeiasComunidades", "aldeiasComunidadesLista", "documentos", "coordenadas", "mapasCartograficos", "detalhesVulnerabilidades", "dataDocumento", "tipoDocumento", "paginasDocumento", "numeroSei", "numeroProcessoDocumento", "eventosAssuntos", "tipoCoordenada", "outroFormatoCoordenada", "latitude", "latitudeDirecao", "longitude", "longitudeDirecao", "coordenadaSedeMunicipio", "comentarioCoordenada", "numeroSeiMapa", "paginaMapa"].includes(name)) return;
    if (value === undefined) return;

    const element = form.elements[name];
    if (!element) return;

    const fieldList = element instanceof RadioNodeList ? Array.from(element) : [element];

    fieldList.forEach((field) => {
      if (field.type === "checkbox") {
        field.checked = asListOrSplit(value).includes(field.value);
      } else if (field.type === "radio") {
        field.checked = field.value === value;
      } else if (field.type === "date") {
        field.value = normalizeDateForInput(value);
      } else if (field.tagName === "SELECT") {
        const hasOption = Array.from(field.options).some((option) => option.value === value || option.textContent === value);
        field.value = hasOption ? value || "" : "";
      } else {
        field.value = shouldDisplayDateAsBrazil(name) ? converterDataParaBR(value) : value || "";
      }
    });
  });
}

function shouldDisplayDateAsBrazil(name) {
  return [
    "dataRoteiro",
    "dataAcaoJudicial",
    "dataDecisao"
  ].includes(name);
}

function flattenDraft(draft) {
  return {
    consultorEmail: pickField(draft, directValue(() => draft.consultor?.email), "ConsultorEmail", "consultorEmail"),
    consultorNome: pickField(draft, directValue(() => draft.consultor?.nome), "ConsultorNome", "Title", "consultorNome"),
    areaEstudo: pickField(draft, directValue(() => draft.consultor?.areaEstudo), "AreaEstudo", "field_1", "areaEstudo"),
    reivindicacaoId: pickField(draft, directValue(() => draft.reivindicacao?.id), "ReivindicacaoId", "field_2", "reivindicacaoId"),
    nomeReivindicacao: pickField(draft, directValue(() => draft.reivindicacao?.nome), "NomeReivindicacao", "field_3", "nomeReivindicacao"),
    outrosNomes: pickField(draft, directValue(() => draft.reivindicacao?.outrosNomes), "OutrosNomes", "field_4", "outrosNomes"),
    outrosNomesTexto: pickField(draft, directValue(() => draft.reivindicacao?.outrosNomesTexto), "OutrosNomesTexto", "field_5", "outrosNomesTexto"),
    processosAnalisados: normalizarProcessosAnalisados(
      pickField(draft, directValue(() => draft.reivindicacao?.processosAnalisados), "ProcessosAnalisados", "processosAnalisados"),
      pickField(draft, directValue(() => draft.reivindicacao?.numerosProcesso), "NumerosProcesso", "field_6", "numerosProcesso", directValue(() => draft.reivindicacao?.numeroProcesso), "numeroProcesso"),
      draft.resumoProcesso?.descricaoProcessosAnalisados || draft.reivindicacao?.descricaoProcessosAnalisados
    ),
    numerosProcesso: asListOrSplit(pickField(draft, directValue(() => draft.reivindicacao?.numerosProcesso), "NumerosProcesso", "field_6", "numerosProcesso", directValue(() => draft.reivindicacao?.numeroProcesso), "numeroProcesso")),
    descricaoProcessosAnalisados: draft.resumoProcesso?.descricaoProcessosAnalisados || draft.reivindicacao?.descricaoProcessosAnalisados,
    temRoteiro: pickField(draft, directValue(() => draft.reivindicacao?.temRoteiro), "TemRoteiro", "field_7", "temRoteiro"),
    dataRoteiro: pickField(draft, directValue(() => draft.reivindicacao?.dataRoteiro), "DataRoteiro", "field_8", "dataRoteiro"),
    numeroSeiQualificacao: draft.reivindicacao?.numeroSeiQualificacao,
    etnias: asListOrSplit(pickField(draft, directValue(() => draft.reivindicacao?.etnias), "Etnias", "field_9", "etnias")),
    outraEtnia: pickField(draft, directValue(() => draft.reivindicacao?.outraEtnia), "OutraEtnia", "field_10", "outraEtnia"),
    outrasEtnias: asListOrSplit(draft.reivindicacao?.outrasEtnias || draft.reivindicacao?.outraEtnia),
    tipoDemanda: asListOrSplit(pickField(draft, directValue(() => draft.reivindicacao?.tipoDemanda), "TipoDemanda", "field_11", "tipoDemanda")),
    modalidadeConstituicao: pickField(draft, directValue(() => draft.reivindicacao?.modalidadeConstituicao), "ModalidadeConstituicao", "field_12", "modalidadeConstituicao"),
    temJustificativaRevisao: pickField(draft, directValue(() => draft.reivindicacao?.temJustificativaRevisao), "TemJustificativaRevisao", "temJustificativaRevisao"),
    justificativaRevisao: pickField(draft, directValue(() => draft.reivindicacao?.justificativaRevisao), "JustificativaRevisao", "field_13", "justificativaRevisao"),
    estados: asListOrSplit(pickField(draft, directValue(() => draft.reivindicacao?.estados), "Estados", "field_14", "estados", directValue(() => draft.reivindicacao?.estado), "estado")),
    municipios: asListOrSplit(pickField(draft, directValue(() => draft.reivindicacao?.municipios), "Municipios", "field_15", "municipios", directValue(() => draft.reivindicacao?.municipio), "municipio")),
    coordenacaoRegional: pickField(draft, directValue(() => draft.reivindicacao?.coordenacaoRegional), "CoordenacaoRegional", "field_16", "coordenacaoRegional"),
    temRetomada: pickField(draft, directValue(() => draft.caracterizacaoArea?.temRetomada), directValue(() => draft.reivindicacao?.temRetomada), "TemRetomada", "field_17", "temRetomada"),
    detalhesRetomada: pickField(draft, directValue(() => draft.caracterizacaoArea?.detalhesRetomada), directValue(() => draft.reivindicacao?.detalhesRetomada), "DetalhesRetomada", "field_18", "detalhesRetomada"),
    descricaoReivindicacao: draft.resumoProcesso?.descricao,
    documentos: normalizeDocumentos(draft.resumoProcesso?.documentos || draft.Documentos || draft.documentos),
    dataDocumento: draft.resumoProcesso?.dataDocumento,
    tipoDocumento: draft.resumoProcesso?.tipoDocumento,
    paginasDocumento: draft.resumoProcesso?.paginas,
    numeroSei: draft.resumoProcesso?.numeroSei,
    eventosAssuntos: draft.resumoProcesso?.eventosAssuntos,
    estaJudicializado: draft.statusProcesso?.estaJudicializado,
    motivacaoJudicializacao: draft.statusProcesso?.motivacaoJudicializacao,
    classificacaoJudicializacao: draft.statusProcesso?.classificacaoJudicializacao,
    classificacaoJudicializacaoOutros: draft.statusProcesso?.classificacaoJudicializacaoOutros,
    acoesJudiciais: draft.statusProcesso?.acoesJudiciais,
    descricaoAcao: draft.statusProcesso?.descricaoAcao,
    parteAutoraAcao: draft.statusProcesso?.parteAutoraAcao,
    numeroProcessoSeiJudicial: draft.statusProcesso?.numeroProcessoSeiJudicial,
    numeroAcaoJudicial: draft.statusProcesso?.numeroAcaoJudicial,
    dataAcaoJudicial: draft.statusProcesso?.dataAcaoJudicial,
    detalhesJudicializacao: draft.statusProcesso?.detalhesJudicializacao,
    temDecisao: draft.statusProcesso?.temDecisao,
    numeroDecisao: draft.statusProcesso?.numeroDecisao,
    dataDecisao: draft.statusProcesso?.dataDecisao,
    sentenca: draft.statusProcesso?.sentenca,
    detalhesDecisao: draft.statusProcesso?.detalhesDecisao,
    numeroProcessoJudicial: draft.statusProcesso?.numeroProcessoJudicial,
    localizacaoDemanda: draft.caracterizacaoArea?.localizacaoDemanda,
    temCoordenadas: draft.caracterizacaoArea?.temCoordenadas,
    coordenadas: normalizeCoordenadas(draft.caracterizacaoArea?.coordenadasDetalhadas || draft.caracterizacaoArea?.coordenadas || draft.Coordenadas || draft.coordenadas),
    tipoCoordenada: draft.caracterizacaoArea?.tipoCoordenada,
    outroFormatoCoordenada: draft.caracterizacaoArea?.outroFormatoCoordenada,
    latitude: draft.caracterizacaoArea?.latitude,
    latitudeDirecao: draft.caracterizacaoArea?.latitudeDirecao,
    longitude: draft.caracterizacaoArea?.longitude,
    longitudeDirecao: draft.caracterizacaoArea?.longitudeDirecao,
    coordenadaSedeMunicipio: draft.caracterizacaoArea?.coordenadaSedeMunicipio,
    comentarioCoordenada: draft.caracterizacaoArea?.comentarioCoordenada,
    temMapaCartografico: draft.caracterizacaoArea?.temMapaCartografico,
    mapasCartograficos: normalizeMapasCartograficos(draft.caracterizacaoArea?.mapasCartograficos || draft.MapasCartograficos || draft.mapasCartograficos),
    bioma: draft.caracterizacaoArea?.bioma,
    citaAldeiasComunidades: draft.caracterizacaoArea?.citaAldeiasComunidades,
    aldeiasComunidades: draft.caracterizacaoArea?.aldeiasComunidades,
    aldeiasComunidadesLista: asListOrSplit(draft.caracterizacaoArea?.aldeiasComunidadesLista || draft.caracterizacaoArea?.aldeiasComunidades),
    contextoUrbano: draft.caracterizacaoArea?.contextoUrbano,
    faixaFronteira: draft.caracterizacaoArea?.faixaFronteira,
    sobreposicoes: draft.caracterizacaoArea?.sobreposicoes,
    tiposSobreposicao: draft.caracterizacaoArea?.tiposSobreposicao,
    detalheUcFederal: draft.caracterizacaoArea?.detalheUcFederal,
    detalheUcEstadual: draft.caracterizacaoArea?.detalheUcEstadual,
    detalheUcMunicipal: draft.caracterizacaoArea?.detalheUcMunicipal,
    detalheGlebaFederal: draft.caracterizacaoArea?.detalheGlebaFederal,
    detalheGlebaEstadual: draft.caracterizacaoArea?.detalheGlebaEstadual,
    detalheTerritorioQuilombola: draft.caracterizacaoArea?.detalheTerritorioQuilombola,
    detalheProjetoAssentamento: draft.caracterizacaoArea?.detalheProjetoAssentamento,
    detalheProjetoAssentamentoAgroextrativista: draft.caracterizacaoArea?.detalheProjetoAssentamentoAgroextrativista,
    detalheProjetoDesenvolvimentoSustentavel: draft.caracterizacaoArea?.detalheProjetoDesenvolvimentoSustentavel,
    detalheProjetoAssentamentoFlorestal: draft.caracterizacaoArea?.detalheProjetoAssentamentoFlorestal,
    detalheOutrasSobreposicoes: draft.caracterizacaoArea?.detalheOutrasSobreposicoes,
    indigenasArea: draft.ocupacaoIndigena?.indigenasArea,
    tempoOcupacao: draft.ocupacaoIndigena?.tempoOcupacao,
    dataReferenciaOcupacao: draft.ocupacaoIndigena?.dataReferenciaOcupacao,
    vulnerabilidades: draft.ocupacaoIndigena?.vulnerabilidades,
    outroCriterioVulnerabilidade: draft.ocupacaoIndigena?.outroCriterioVulnerabilidade || getOutroCriterioVulnerabilidade(draft.ocupacaoIndigena?.detalhesVulnerabilidades),
    detalhesVulnerabilidades: normalizeDetalhesVulnerabilidades(draft.ocupacaoIndigena?.detalhesVulnerabilidades),
    fonteVulnerabilidade: draft.ocupacaoIndigena?.fonteVulnerabilidade,
    dataReferenciaVulnerabilidade: draft.ocupacaoIndigena?.dataReferenciaVulnerabilidade,
    comunidadesTradicionais: draft.ocupacaoIndigena?.comunidadesTradicionais,
    tiposComunidadeTradicional: asListOrSplit(draft.ocupacaoIndigena?.tiposComunidadeTradicional),
    detalhesComunidadesTradicionais: normalizeDetalhesComunidadesTradicionais(draft.ocupacaoIndigena?.detalhesComunidadesTradicionais),
    descricaoComunidadeTradicional: draft.ocupacaoIndigena?.descricaoComunidadeTradicional,
    dataReferenciaComunidadeTradicional: draft.ocupacaoIndigena?.dataReferenciaComunidadeTradicional,
    conflitoInteretnico: draft.ocupacaoIndigena?.conflitoInteretnico,
    tiposConflito: draft.ocupacaoIndigena?.tiposConflito,
    outroTipoConflito: draft.ocupacaoIndigena?.outroTipoConflito,
    envolvidosConflito: draft.ocupacaoIndigena?.envolvidosConflito,
    motivoConflitoInteretnico: draft.ocupacaoIndigena?.motivoConflitoInteretnico,
    etniaConflitoInteretnico: draft.ocupacaoIndigena?.etniaConflitoInteretnico,
    dataReferenciaConflitoInteretnico: draft.ocupacaoIndigena?.dataReferenciaConflitoInteretnico,
    fonteConflito: draft.ocupacaoIndigena?.fonteConflito,
    reintegracaoPosse: draft.ocupacaoIndigena?.reintegracaoPosse,
    descricaoReintegracaoPosse: draft.ocupacaoIndigena?.descricaoReintegracaoPosse,
    outrasAcoesJudiciaisComunidade: draft.ocupacaoIndigena?.outrasAcoesJudiciaisComunidade,
    descricaoOutrasAcoesJudiciaisComunidade: draft.ocupacaoIndigena?.descricaoOutrasAcoesJudiciaisComunidade,
    informacoesAdicionais: draft.ocupacaoIndigena?.informacoesAdicionais
  };
}

function splitLegacyList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function directValue(getValue) {
  return {
    isDirectValue: true,
    getValue
  };
}

function pickField(source, ...candidates) {
  for (const candidate of candidates) {
    const value = candidate?.isDirectValue ? candidate.getValue() : source?.[candidate];
    if (value !== undefined && value !== null && value !== "") return value;
  }

  return "";
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

function normalizarTextoParaPowerAutomate(valor) {
  if (valor === null || valor === undefined) return "";
  if (Array.isArray(valor)) return valor;
  if (typeof valor === "object") return valor;
  return String(valor);
}

function normalizarPayloadParaPowerAutomate(payload) {
  const normalizado = {
    ...payload,
    reivindicacao: { ...(payload.reivindicacao || {}) },
    resumoProcesso: { ...(payload.resumoProcesso || {}) },
    statusProcesso: { ...(payload.statusProcesso || {}) },
    caracterizacaoArea: { ...(payload.caracterizacaoArea || {}) },
    ocupacaoIndigena: { ...(payload.ocupacaoIndigena || {}) }
  };

  const camposTexto = [
    ["reivindicacao", "descricaoProcessosAnalisados"],
    ["resumoProcesso", "descricao"],
    ["resumoProcesso", "descricaoReivindicacao"],
    ["statusProcesso", "motivacaoJudicializacao"],
    ["statusProcesso", "descricaoAcao"],
    ["statusProcesso", "detalhesJudicializacao"],
    ["statusProcesso", "detalhesDecisao"],
    ["caracterizacaoArea", "localizacaoDemanda"],
    ["caracterizacaoArea", "detalhesRetomada"],
    ["ocupacaoIndigena", "motivoConflitoInteretnico"],
    ["ocupacaoIndigena", "descricaoReintegracaoPosse"],
    ["ocupacaoIndigena", "descricaoOutrasAcoesJudiciaisComunidade"],
    ["ocupacaoIndigena", "informacoesAdicionais"]
  ];

  camposTexto.forEach(([bloco, campo]) => {
    if (!normalizado[bloco] || !(campo in normalizado[bloco])) return;
    normalizado[bloco][campo] = normalizarTextoParaPowerAutomate(normalizado[bloco][campo]);
  });

  return normalizado;
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

function converterDataParaISO(dataBr) {
  const text = asText(dataBr).trim();
  if (!text) return "";

  const isoDate = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate && isDataValida(text)) {
    const value = `${isoDate[1]}-${isoDate[2]}-${isoDate[3]}`;
    console.log("data enviada ISO", value);
    return value;
  }

  const brazilDate = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brazilDate && isDataValida(text)) {
    const value = `${brazilDate[3]}-${brazilDate[2]}-${brazilDate[1]}`;
    console.log("data enviada ISO", value);
    return value;
  }

  return "";
}

function converterDataParaBR(dataIso) {
  const text = asText(dataIso).trim();
  if (!text) return "";

  const brazilDate = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brazilDate) {
    console.log("data exibida BR", text);
    return text;
  }

  const isoDate = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate) {
    const value = `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}`;
    console.log("data exibida BR", value);
    return value;
  }

  return text;
}

function formatDateToBrazil(value) {
  return converterDataParaBR(value);
}

function normalizeDateForInput(value) {
  const text = asText(value).trim();
  if (!text) return "";
  const brazilDate = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brazilDate) return `${brazilDate[3]}-${brazilDate[2]}-${brazilDate[1]}`;

  const isoDate = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate) return `${isoDate[1]}-${isoDate[2]}-${isoDate[3]}`;

  return "";
}

function isDataValida(valor) {
  const text = asText(valor).trim();
  if (!text) return false;

  let year;
  let month;
  let day;
  const isoDate = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const brazilDate = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (isoDate) {
    year = Number(isoDate[1]);
    month = Number(isoDate[2]);
    day = Number(isoDate[3]);
  } else if (brazilDate) {
    day = Number(brazilDate[1]);
    month = Number(brazilDate[2]);
    year = Number(brazilDate[3]);
  } else {
    return false;
  }

  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day;
}

function getCheckedValues(name) {
  return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((field) => field.value);
}

function populateEtniaOptions() {
  etniaOptions.innerHTML = allEtnias
    .filter((etnia) => !selectedEtnias.includes(etnia))
    .map((etnia) => `<option value="${etnia}"></option>`)
    .join("");
}

async function loadEtniaData() {
  try {
    const response = await fetch(ETNIAS_CSV_URL);
    if (!response.ok) throw new Error(`Falha ao carregar ${ETNIAS_CSV_URL}`);

    const csvText = await response.text();
    allEtnias = parseEtniasCsv(csvText);
    populateEtniaOptions();
  } catch (error) {
    allEtnias = ["Outros"];
    etniaInput.placeholder = "Não foi possível carregar etnias";
    populateEtniaOptions();
  }
}

function parseEtniasCsv(csvText) {
  const [, ...dataRows] = parseDelimitedRows(csvText, ",");
  const etnias = dataRows.map((row) => String(row[0] || "").trim()).filter(Boolean);
  return Array.from(new Set(etnias));
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

function handleOutraEtniaKeydown(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addSelectedOutraEtnia();
}

function addSelectedEtnia() {
  const value = etniaInput.value.trim();
  if (!value || selectedEtnias.includes(value) || !allEtnias.includes(value)) return;

  selectedEtnias.push(value);
  etniaInput.value = "";
  renderEtniaChips();
  populateEtniaOptions();
  updateConditionals();
  clearResolvedValidationErrors();
}

function removeSelectedEtnia(event) {
  const button = event.target.closest("button[data-etnia]");
  if (!button) return;

  selectedEtnias = selectedEtnias.filter((etnia) => etnia !== button.dataset.etnia);
  renderEtniaChips();
  populateEtniaOptions();
  updateConditionals();
  clearResolvedValidationErrors();
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

function addSelectedOutraEtnia() {
  const value = outraEtniaInput.value.trim();
  if (!value || selectedOutrasEtnias.includes(value)) return;

  selectedOutrasEtnias.push(value);
  outraEtniaInput.value = "";
  renderOutraEtniaChips();
  clearResolvedValidationErrors();
}

function removeSelectedOutraEtnia(event) {
  const button = event.target.closest("button[data-outra-etnia]");
  if (!button) return;

  selectedOutrasEtnias = selectedOutrasEtnias.filter((etnia) => etnia !== button.dataset.outraEtnia);
  renderOutraEtniaChips();
  clearResolvedValidationErrors();
}

function renderOutraEtniaChips() {
  renderChips(outraEtniaChips, selectedOutrasEtnias, "outraEtnia", "Remover outra etnia");
}

function getSelectedOutrasEtnias() {
  return selectedOutrasEtnias.filter(Boolean);
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
  clearResolvedValidationErrors();
}

function removeSelectedEstado(event) {
  const button = event.target.closest("button[data-estado]");
  if (!button) return;

  selectedEstados = selectedEstados.filter((estado) => estado !== button.dataset.estado);
  renderEstadoChips();
  populateEstadoOptions();
  pruneSelectedMunicipios();
  populateMunicipioOptions();
  clearResolvedValidationErrors();
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
  clearResolvedValidationErrors();
}

function removeSelectedMunicipio(event) {
  const button = event.target.closest("button[data-municipio]");
  if (!button) return;

  selectedMunicipios = selectedMunicipios.filter((municipio) => municipio !== button.dataset.municipio);
  renderMunicipioChips();
  populateMunicipioOptions();
  clearResolvedValidationErrors();
}

function renderMunicipioChips() {
  renderChips(municipioChips, selectedMunicipios, "municipio", "Remover município");
}

function getSelectedMunicipios() {
  return selectedMunicipios.filter(Boolean);
}

function populateComunidadeTradicionalOptions() {
  comunidadeTradicionalOptions.innerHTML = COMUNIDADES_TRADICIONAIS
    .filter((item) => !selectedComunidadesTradicionais.includes(item))
    .map((item) => `<option value="${item}"></option>`)
    .join("");
}

function handleComunidadeTradicionalKeydown(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addSelectedComunidadeTradicional();
}

function addSelectedComunidadeTradicional() {
  const value = comunidadeTradicionalInput.value.trim();
  if (!value || selectedComunidadesTradicionais.includes(value) || !COMUNIDADES_TRADICIONAIS.includes(value)) return;

  selectedComunidadesTradicionais.push(value);
  comunidadeTradicionalInput.value = "";
  renderComunidadeTradicionalChips();
  populateComunidadeTradicionalOptions();
  renderComunidadeTradicionalDetalhes();
  updateConditionals();
}

function removeSelectedComunidadeTradicional(event) {
  const button = event.target.closest("button[data-comunidade-tradicional]");
  if (!button) return;

  selectedComunidadesTradicionais = selectedComunidadesTradicionais.filter((item) => item !== button.dataset.comunidadeTradicional);
  renderComunidadeTradicionalChips();
  populateComunidadeTradicionalOptions();
  renderComunidadeTradicionalDetalhes();
  updateConditionals();
}

function renderComunidadeTradicionalChips() {
  renderChips(comunidadeTradicionalChips, selectedComunidadesTradicionais, "comunidadeTradicional", "Remover comunidade tradicional");
}

function getSelectedComunidadesTradicionais() {
  return selectedComunidadesTradicionais.filter(Boolean);
}

function renderComunidadeTradicionalDetalhes(existingDetails = []) {
  const previous = new Map(getDetalhesComunidadesTradicionais().map((item) => [item.tipo, item]));
  normalizeDetalhesComunidadesTradicionais(existingDetails).forEach((item) => previous.set(item.tipo, item));

  comunidadeTradicionalDetalhes.innerHTML = "";
  if (!selectedComunidadesTradicionais.length) return;

  const header = document.createElement("div");
  header.className = "community-detail-row header";
  header.innerHTML = "<strong>Comunidade</strong><strong>Fonte do dado</strong><strong>De quando é o dado?</strong>";
  comunidadeTradicionalDetalhes.append(header);

  selectedComunidadesTradicionais.forEach((tipo) => {
    const detail = previous.get(tipo) || {};
    const row = document.createElement("div");
    row.className = "community-detail-row";
    row.dataset.communityDetail = tipo;
    row.innerHTML = `
      <span>${tipo}</span>
      <input name="fonteComunidadeTradicional" data-community-source="${tipo}" type="text" placeholder="Documento de origem">
      <input name="dataComunidadeTradicional" data-community-date="${tipo}" type="text" placeholder="Referência do dado">
    `;
    row.querySelector("[data-community-source]").value = asText(detail.fonte);
    row.querySelector("[data-community-date]").value = asText(detail.dataReferencia);
    comunidadeTradicionalDetalhes.append(row);
  });
}

function getDetalhesComunidadesTradicionais() {
  return Array.from(comunidadeTradicionalDetalhes.querySelectorAll("[data-community-detail]"))
    .map((row) => {
      const tipo = row.dataset.communityDetail;
      const fonte = asText(row.querySelector("[data-community-source]")?.value);
      const dataReferencia = asText(row.querySelector("[data-community-date]")?.value);
      return { tipo, fonte, dataReferencia };
    })
    .filter((item) => item.tipo);
}

function getPrimeiroDetalheComunidadeTradicional() {
  return getDetalhesComunidadesTradicionais()[0] || {};
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

function handleDocumentoTableClick(event) {
  const removeButton = event.target.closest(".remove-documento-btn");
  if (removeButton) {
    removeDocumentoRow(removeButton.closest(".document-row"));
    return;
  }

  const addButton = event.target.closest(".add-documento-row-btn");
  if (addButton) addDocumentoRow();
}

function addDocumentoRow(documento = {}, shouldFocus = true) {
  const row = document.createElement("tr");
  row.className = "document-row";
  row.innerHTML = `
    <td><input name="dataDocumento" type="text" inputmode="numeric" placeholder="dd/mm/aaaa" aria-label="Data"></td>
    <td><input name="tipoDocumento" type="text" placeholder="Tipo de documento" aria-label="Tipo de documento"></td>
    <td><input name="paginasDocumento" type="number" min="0" placeholder="Página" aria-label="Página para o caso de dossiê/volume digitalizado"></td>
    <td><input name="eventosAssuntos" type="text" placeholder="Digite o assunto" aria-label="Assunto"></td>
    <td><input name="numeroSei" type="text" placeholder="Nº SEI" aria-label="Nº SEI"></td>
    <td><input name="numeroProcessoDocumento" type="text" placeholder="Nº do processo" aria-label="Nº do processo"></td>
    <td class="document-actions">
      <button type="button" class="icon-button remove-documento-btn" aria-label="Remover documento">×</button>
      <button type="button" class="icon-button add-documento-row-btn" aria-label="Adicionar documento">+</button>
    </td>
  `;
  documentosTableBody.append(row);
  setDocumentoRowValues(row, documento);
  if (shouldFocus) row.querySelector("input, textarea")?.focus();
}

function removeDocumentoRow(row) {
  if (!row) return;
  const rows = Array.from(documentosTableBody.querySelectorAll(".document-row"));
  if (rows.length > 1) {
    row.remove();
    return;
  }

  setDocumentoRowValues(row, {});
}

function resetDocumentoRows() {
  const rows = Array.from(documentosTableBody.querySelectorAll(".document-row"));
  if (!rows.length) return;
  rows.slice(1).forEach((row) => row.remove());
  setDocumentoRowValues(rows[0], {});
}

function restoreDocumentoRows(documentos = []) {
  const values = asList(documentos);
  resetDocumentoRows();
  if (!values.length) return;

  const [first, ...rest] = values;
  const firstRow = documentosTableBody.querySelector(".document-row");
  setDocumentoRowValues(firstRow, first);
  rest.forEach((documento) => addDocumentoRow(documento, false));
}

function restoreLegacyDocumentoRow(values) {
  const documento = {
    dataDocumento: values.dataDocumento,
    tipoDocumento: values.tipoDocumento,
    paginasDocumento: values.paginasDocumento || values.paginas,
    numeroSei: values.numeroSei,
    numeroProcessoDocumento: values.numeroProcessoDocumento || values.numeroProcesso,
    eventosAssuntos: values.eventosAssuntos
  };

  if (Object.values(documento).some(Boolean)) {
    setDocumentoRowValues(documentosTableBody.querySelector(".document-row"), documento);
  }
}

function setDocumentoRowValues(row, documento) {
  if (!row) return;
  row.querySelector("[name='dataDocumento']").value = converterDataParaBR(documento.dataDocumento);
  row.querySelector("[name='tipoDocumento']").value = asText(documento.tipoDocumento);
  row.querySelector("[name='paginasDocumento']").value = asText(documento.paginasDocumento || documento.paginas);
  row.querySelector("[name='numeroSei']").value = asText(documento.numeroSei);
  row.querySelector("[name='numeroProcessoDocumento']").value = asText(documento.numeroProcessoDocumento || documento.numeroProcesso);
  row.querySelector("[name='eventosAssuntos']").value = asText(documento.eventosAssuntos);
}

function getDocumentosProcesso() {
  return Array.from(documentosTableBody.querySelectorAll(".document-row"))
    .map((row) => ({
      dataDocumento: converterDataParaISO(row.querySelector("[name='dataDocumento']")?.value),
      tipoDocumento: asText(row.querySelector("[name='tipoDocumento']")?.value),
      paginasDocumento: asText(row.querySelector("[name='paginasDocumento']")?.value),
      eventosAssuntos: asText(row.querySelector("[name='eventosAssuntos']")?.value),
      numeroSei: asText(row.querySelector("[name='numeroSei']")?.value),
      numeroProcessoDocumento: asText(row.querySelector("[name='numeroProcessoDocumento']")?.value)
    }))
    .filter((documento) => Object.values(documento).some(Boolean));
}

function normalizeDocumentos(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
}

function handleCoordenadaTableClick(event) {
  const removeButton = event.target.closest(".remove-coordenada-btn");
  if (removeButton) {
    removeCoordenadaRow(removeButton.closest(".coordinate-row"));
    return;
  }

  const addButton = event.target.closest(".add-coordenada-row-btn");
  if (addButton) addCoordenadaRow();
}

function handleCoordenadaTableInput(event) {
  const input = event.target.closest("[data-coordinate-value]");
  updateCoordinateFormatDetails(event.target.closest(".coordinate-row"));
  if (input) input.value = removeLettersFromCoordinate(input.value);
}

function addCoordenadaRow(coordenada = {}, shouldFocus = true) {
  const row = document.createElement("tr");
  row.className = "coordinate-row";
  row.innerHTML = `
    <td><input name="latitude" type="text" data-coordinate-value placeholder="Ex: 15° 47' 39&quot; S ou -15.7942" aria-label="Latitude"></td>
    <td>
      <select name="latitudeDirecao" aria-label="Direção da latitude" hidden>
        <option value="">Escolha</option>
        <option>Norte</option>
        <option>Sul</option>
      </select>
    </td>
    <td><input name="longitude" type="text" data-coordinate-value placeholder="Ex: 47° 52' 56&quot; O ou -47.8822" aria-label="Longitude"></td>
    <td>
      <select name="longitudeDirecao" aria-label="Direção da longitude" hidden>
        <option value="">Escolha</option>
        <option>Leste</option>
        <option>Oeste</option>
      </select>
    </td>
    <td>
      <select name="coordenadaSedeMunicipio" aria-label="Coordenada localizada na sede do municipio">
        <option value="">Escolha</option>
        <option>Sim</option>
        <option>Não</option>
      </select>
    </td>
    <td><input name="comentarioCoordenada" type="text" placeholder="Comentário da coordenada" aria-label="Comentário da coordenada"></td>
    <td class="coordinate-actions">
      <button type="button" class="icon-button remove-coordenada-btn" aria-label="Remover coordenada">×</button>
      <button type="button" class="icon-button add-coordenada-row-btn" aria-label="Adicionar coordenada">+</button>
    </td>
  `;
  coordenadasTableBody.append(row);
  setCoordenadaRowValues(row, coordenada);
  if (shouldFocus) row.querySelector("input, select")?.focus();
}

function removeCoordenadaRow(row) {
  if (!row) return;
  const rows = Array.from(coordenadasTableBody.querySelectorAll(".coordinate-row"));
  if (rows.length > 1) {
    row.remove();
    return;
  }

  setCoordenadaRowValues(row, {});
}

function resetCoordenadaRows() {
  const rows = Array.from(coordenadasTableBody.querySelectorAll(".coordinate-row"));
  if (!rows.length) return;
  rows.slice(1).forEach((row) => row.remove());
  setCoordenadaRowValues(rows[0], {});
}

function restoreCoordenadaRows(coordenadas = []) {
  const values = asList(coordenadas);
  resetCoordenadaRows();
  if (!values.length) return;

  const [first, ...rest] = values;
  setCoordenadaRowValues(coordenadasTableBody.querySelector(".coordinate-row"), first);
  rest.forEach((coordenada) => addCoordenadaRow(coordenada, false));
}

function restoreLegacyCoordenadaRow(values) {
  const coordenada = {
    tipoCoordenada: values.tipoCoordenada,
    outroFormatoCoordenada: values.outroFormatoCoordenada,
    latitude: values.latitude,
    latitudeDirecao: values.latitudeDirecao,
    longitude: values.longitude,
    longitudeDirecao: values.longitudeDirecao,
    coordenadaSedeMunicipio: values.coordenadaSedeMunicipio,
    comentarioCoordenada: values.comentarioCoordenada || values.comentario
  };

  if (Object.values(coordenada).some(Boolean)) {
    setCoordenadaRowValues(coordenadasTableBody.querySelector(".coordinate-row"), coordenada);
  }
}

function setCoordenadaRowValues(row, coordenada) {
  if (!row) return;
  if (row.querySelector("[name='tipoCoordenada']")) row.querySelector("[name='tipoCoordenada']").value = asText(coordenada.tipoCoordenada);
  if (row.querySelector("[name='outroFormatoCoordenada']")) row.querySelector("[name='outroFormatoCoordenada']").value = asText(coordenada.outroFormatoCoordenada);
  row.querySelector("[name='latitude']").value = asText(coordenada.latitude);
  if (row.querySelector("[name='latitudeDirecao']")) row.querySelector("[name='latitudeDirecao']").value = asText(coordenada.latitudeDirecao);
  row.querySelector("[name='longitude']").value = asText(coordenada.longitude);
  if (row.querySelector("[name='longitudeDirecao']")) row.querySelector("[name='longitudeDirecao']").value = asText(coordenada.longitudeDirecao);
  row.querySelector("[name='coordenadaSedeMunicipio']").value = asText(coordenada.coordenadaSedeMunicipio);
  row.querySelector("[name='comentarioCoordenada']").value = asText(coordenada.comentarioCoordenada || coordenada.comentario);
  updateCoordinateFormatDetails(row);
}

function getCoordenadasDetalhadas() {
  return Array.from(coordenadasTableBody.querySelectorAll(".coordinate-row"))
    .map((row) => ({
      tipoCoordenada: asText(row.querySelector("[name='tipoCoordenada']")?.value),
      outroFormatoCoordenada: asText(row.querySelector("[name='outroFormatoCoordenada']")?.value),
      latitude: asText(row.querySelector("[name='latitude']")?.value),
      latitudeDirecao: asText(row.querySelector("[name='latitudeDirecao']")?.value),
      longitude: asText(row.querySelector("[name='longitude']")?.value),
      longitudeDirecao: asText(row.querySelector("[name='longitudeDirecao']")?.value),
      coordenadaSedeMunicipio: asText(row.querySelector("[name='coordenadaSedeMunicipio']")?.value),
      comentarioCoordenada: asText(row.querySelector("[name='comentarioCoordenada']")?.value)
    }))
    .filter((coordenada) => Object.values(coordenada).some(Boolean));
}

function getCoordenadasGeograficas() {
  return getCoordenadasDetalhadas().map((coordenada) => ({
    latitude: asText(coordenada.latitude),
    latitudeDirecao: asText(coordenada.latitudeDirecao),
    longitude: asText(coordenada.longitude),
    longitudeDirecao: asText(coordenada.longitudeDirecao),
    comentario: asText(coordenada.comentarioCoordenada)
  }));
}

function handleMapaTableClick(event) {
  const removeButton = event.target.closest(".remove-mapa-btn");
  if (removeButton) {
    removeMapaRow(removeButton.closest(".map-row"));
    return;
  }

  const addButton = event.target.closest(".add-mapa-row-btn");
  if (addButton) addMapaRow();
}

function addMapaRow(mapa = {}, shouldFocus = true) {
  const row = document.createElement("tr");
  row.className = "map-row";
  row.innerHTML = `
    <td><input name="numeroSeiMapa" type="text" placeholder="Nº do documento SEI" aria-label="Nº do documento SEI"></td>
    <td><input name="paginaMapa" type="number" min="0" placeholder="Página" aria-label="Página do mapa ou material cartográfico"></td>
    <td class="document-actions">
      <button type="button" class="icon-button remove-mapa-btn" aria-label="Remover mapa ou material cartográfico">×</button>
      <button type="button" class="icon-button add-mapa-row-btn" aria-label="Adicionar mapa ou material cartográfico">+</button>
    </td>
  `;
  mapasTableBody.append(row);
  setMapaRowValues(row, mapa);
  if (shouldFocus) row.querySelector("input")?.focus();
}

function removeMapaRow(row) {
  if (!row) return;
  const rows = Array.from(mapasTableBody.querySelectorAll(".map-row"));
  if (rows.length > 1) {
    row.remove();
    return;
  }

  setMapaRowValues(row, {});
}

function resetMapaRows() {
  const rows = Array.from(mapasTableBody.querySelectorAll(".map-row"));
  if (!rows.length) return;
  rows.slice(1).forEach((row) => row.remove());
  setMapaRowValues(rows[0], {});
}

function restoreMapaRows(mapas = []) {
  const values = normalizeMapasCartograficos(mapas);
  resetMapaRows();
  if (!values.length) return;

  const [first, ...rest] = values;
  setMapaRowValues(mapasTableBody.querySelector(".map-row"), first);
  rest.forEach((mapa) => addMapaRow(mapa, false));
}

function setMapaRowValues(row, mapa) {
  if (!row) return;
  row.querySelector("[name='numeroSeiMapa']").value = asText(mapa.numeroSei || mapa.numeroSeiMapa || mapa.documentoSei);
  row.querySelector("[name='paginaMapa']").value = asText(mapa.pagina || mapa.paginaMapa);
}

function getMapasCartograficos() {
  return Array.from(mapasTableBody.querySelectorAll(".map-row"))
    .map((row) => ({
      numeroSei: asText(row.querySelector("[name='numeroSeiMapa']")?.value),
      pagina: asText(row.querySelector("[name='paginaMapa']")?.value)
    }))
    .filter((mapa) => mapa.numeroSei || mapa.pagina);
}

function normalizeMapasCartograficos(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
}

function updateCoordinateFormatDetails(row = null) {
  const rows = row ? [row] : Array.from(coordenadasTableBody.querySelectorAll(".coordinate-row"));
  rows.forEach((coordinateRow) => {
    if (!coordinateRow) return;
    const format = coordinateRow.querySelector("[name='tipoCoordenada']")?.value;
    const detail = coordinateRow.querySelector("[name='outroFormatoCoordenada']");
    if (!detail) return;

    const isOther = format === "Outro";
    detail.classList.toggle("is-visible", isOther);
    if (!isOther) detail.value = "";
  });
}

function updateVulnerabilityDetails() {
  const selected = new Set(getCheckedValues("vulnerabilidades"));
  const table = form.querySelector(".vulnerability-detail-table");
  const outroLabel = form.querySelector('[data-vulnerability-detail="Outros"] span');
  const outroTexto = asText(getValue("outroCriterioVulnerabilidade"));

  if (outroLabel) outroLabel.textContent = outroTexto || "Outros";
  table?.classList.toggle("has-visible-items", selected.size > 0);

  form.querySelectorAll("[data-vulnerability-detail]").forEach((row) => {
    row.classList.toggle("is-visible", selected.has(row.dataset.vulnerabilityDetail));
  });
}

function getDetalhesVulnerabilidades() {
  return Array.from(form.querySelectorAll("[data-vulnerability-detail]"))
    .map((row) => {
      const criterio = row.dataset.vulnerabilityDetail;
      const criterioDescricao = criterio === "Outros" ? asText(getValue("outroCriterioVulnerabilidade")) : "";
      const fonte = asText(row.querySelector("[data-vulnerability-source]")?.value);
      const dataReferencia = asText(row.querySelector("[data-vulnerability-date]")?.value);
      return { criterio, criterioDescricao, fonte, dataReferencia };
    })
    .filter((item) => item.criterioDescricao || item.fonte || item.dataReferencia);
}

function restoreDetalhesVulnerabilidades(detalhes = []) {
  const values = normalizeDetalhesVulnerabilidades(detalhes);
  values.forEach((item) => {
    const row = form.querySelector(`[data-vulnerability-detail="${item.criterio}"]`);
    if (!row) return;
    const source = row.querySelector("[data-vulnerability-source]");
    const date = row.querySelector("[data-vulnerability-date]");
    if (source) source.value = asText(item.fonte);
    if (date) date.value = asText(item.dataReferencia);
  });
}

function normalizeDetalhesVulnerabilidades(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
}

function getOutroCriterioVulnerabilidade(detalhes = []) {
  const item = normalizeDetalhesVulnerabilidades(detalhes).find((detalhe) => detalhe.criterio === "Outros");
  return asText(item?.criterioDescricao || item?.descricao || item?.outroCriterio);
}

function normalizeDetalhesComunidadesTradicionais(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
}

function areCoordenadasValid() {
  if (getValue("temCoordenadas") !== "Sim") return true;
  const coordenadas = getCoordenadasDetalhadas();
  return coordenadas.some((coordenada) =>
    coordenada.latitude &&
    coordenada.longitude
  );
}

function normalizeCoordenadas(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
}

function removeLettersFromCoordinate(value) {
  return String(value || "");
}

function handleProcessosAnalisadosClick(event) {
  const addButton = event.target.closest(".add-processo-analisado-btn");
  if (addButton) {
    adicionarProcessoAnalisado();
    return;
  }

  const removeButton = event.target.closest(".remove-processo-analisado-btn");
  if (removeButton) {
    removerProcessoAnalisado(removeButton.closest(".process-item"));
  }
}

function adicionarProcessoAnalisado(processo = {}, shouldFocus = true) {
  const item = document.createElement("div");
  const numeroLabel = document.createElement("label");
  const numeroInput = document.createElement("input");
  const descricaoLabel = document.createElement("label");
  const descricaoInput = document.createElement("textarea");
  const actions = document.createElement("div");
  const addButton = document.createElement("button");
  const removeButton = document.createElement("button");

  item.className = "process-item";

  numeroLabel.className = "process-field";
  numeroLabel.append(document.createTextNode("N\u00famero SEI dos processos analisados"));
  numeroInput.name = "numeroSeiProcessoAnalisado";
  numeroInput.type = "text";
  numeroInput.placeholder = "N\u00famero SEI dos processos analisados";
  numeroInput.value = asText(processo.numeroSei || processo.numeroProcesso || processo.numeroProcessoDocumento);
  numeroLabel.append(numeroInput);

  descricaoLabel.className = "process-field";
  descricaoLabel.append(document.createTextNode("Descri\u00e7\u00e3o dos processos analisados"));
  descricaoInput.name = "descricaoProcessoAnalisado";
  descricaoInput.rows = 1;
  descricaoInput.placeholder = "Descreva o tema principal dos processos analisados";
  descricaoInput.value = asText(processo.descricao || processo.descricaoProcessosAnalisados);
  descricaoLabel.append(descricaoInput);

  actions.className = "process-item-actions";
  addButton.type = "button";
  addButton.className = "icon-button add-processo-analisado-btn";
  addButton.setAttribute("aria-label", "Adicionar processo analisado");
  addButton.textContent = "+";
  removeButton.type = "button";
  removeButton.className = "icon-button danger remove-processo-analisado-btn";
  removeButton.setAttribute("aria-label", "Remover processo analisado");
  removeButton.textContent = "\u00d7";
  actions.append(addButton, removeButton);

  item.append(numeroLabel, descricaoLabel, actions);
  processList.append(item);

  if (shouldFocus) numeroInput.focus();
}

function removerProcessoAnalisado(item) {
  const items = Array.from(processList.querySelectorAll(".process-item"));
  if (!item) return;

  if (items.length > 1) {
    const previousItem = item.previousElementSibling || item.nextElementSibling;
    item.remove();
    previousItem?.querySelector("input, textarea")?.focus();
    return;
  }

  item.querySelectorAll("input, textarea").forEach((field) => {
    field.value = "";
  });
  item.querySelector("input")?.focus();
}

function carregarProcessosAnalisados(processos = []) {
  const normalizados = normalizarProcessosAnalisados(processos);
  const registros = normalizados.length ? normalizados : [{ numeroSei: "", descricao: "" }];

  processList.innerHTML = "";
  registros.forEach((processo) => adicionarProcessoAnalisado(processo, false));
}

function getProcessosAnalisados() {
  return Array.from(processList.querySelectorAll(".process-item"))
    .map((item) => ({
      numeroSei: asText(item.querySelector('[name="numeroSeiProcessoAnalisado"]')?.value),
      descricao: asText(item.querySelector('[name="descricaoProcessoAnalisado"]')?.value)
    }))
    .filter((processo) => processo.numeroSei || processo.descricao);
}

function normalizarProcessosAnalisados(processos = [], numerosLegados = [], descricaoLegada = "") {
  let registros = [];

  if (Array.isArray(processos)) {
    registros = processos;
  } else if (typeof processos === "string" && processos.trim()) {
    try {
      const parsed = JSON.parse(processos);
      registros = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      registros = asListOrSplit(processos).map((numeroSei) => ({ numeroSei, descricao: "" }));
    }
  }

  registros = registros
    .map((processo) => {
      if (typeof processo === "string") {
        return { numeroSei: asText(processo), descricao: "" };
      }

      return {
        numeroSei: asText(processo?.numeroSei || processo?.numeroProcesso || processo?.numeroProcessoDocumento),
        descricao: asText(processo?.descricao || processo?.descricaoProcessosAnalisados)
      };
    })
    .filter((processo) => processo.numeroSei || processo.descricao);

  if (registros.length) return registros;

  const numeros = asListOrSplit(numerosLegados);
  const descricao = asText(descricaoLegada);
  if (numeros.length) {
    return numeros.map((numeroSei, index) => ({
      numeroSei,
      descricao: index === 0 ? descricao : ""
    }));
  }

  if (descricao) return [{ numeroSei: "", descricao }];
  return [];
}

function addProcessField(value = "") {
  const label = document.createElement("label");
  const input = document.createElement("input");

  label.className = "process-field";
  input.name = "numeroSeiProcessoAnalisado";
  input.type = "text";
  input.value = value;
  label.append(document.createTextNode("Número SEI dos processos analisados"), input);
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

function handleAldeiaKeydown(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addAldeiaField();
}

function addAldeiaField(value = "") {
  const rawValue = typeof value === "string" && value.trim() ? value : aldeiaInput.value;
  const aldeia = asText(rawValue).trim();
  if (!aldeia || selectedAldeiasComunidades.includes(aldeia)) return;

  selectedAldeiasComunidades.push(aldeia);
  aldeiaInput.value = "";
  renderAldeiaChips();
}

function removeAldeiaField(event) {
  const button = event.target.closest("button[data-aldeia]");
  if (!button) return;

  selectedAldeiasComunidades = selectedAldeiasComunidades.filter((aldeia) => aldeia !== button.dataset.aldeia);
  renderAldeiaChips();
}

function resetAldeiaFields() {
  selectedAldeiasComunidades = [];
  if (aldeiaInput) aldeiaInput.value = "";
  renderAldeiaChips();
}

function restoreAldeiaFields(values) {
  selectedAldeiasComunidades = asListOrSplit(values).filter(Boolean);
  if (aldeiaInput) aldeiaInput.value = "";
  renderAldeiaChips();
}

function renderAldeiaChips() {
  renderChips(aldeiaChips, selectedAldeiasComunidades, "aldeia", "Remover aldeia ou comunidade");
}

function getAldeiasComunidades() {
  return selectedAldeiasComunidades.filter(Boolean);
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
