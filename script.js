const POWER_AUTOMATE_URL = window.APP_CONFIG.POWER_AUTOMATE_URL;
const VERIFY_ACCESS_URL = window.APP_CONFIG.VERIFY_ACCESS_URL;
const SECRET_TOKEN = "FUNAI_FORM_SECRET_2026";
const DRAFT_KEY = "funai-form-draft-v3";
const AUTHORIZED_EMAIL_KEY = "consultorEmailAutorizado";
const MUNICIPIOS_CSV_URL = "municipios-estados.csv";
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

const formApp = document.querySelector("#formApp");
const accessGate = document.querySelector("#accessGate");
const accessForm = document.querySelector("#accessForm");
const accessEmail = document.querySelector("#accessEmail");
const accessSubmitBtn = document.querySelector("#accessSubmitBtn");
const accessMessage = document.querySelector("#accessMessage");
const form = document.querySelector("#funaiForm");
const steps = Array.from(document.querySelectorAll(".step"));
const progressBar = document.querySelector("#progressBar");
const progressTitle = document.querySelector("#progressTitle");
const stepCounter = document.querySelector("#stepCounter");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const submitBtn = document.querySelector("#submitBtn");
const saveDraftBtn = document.querySelector("#saveDraftBtn");
const messageBox = document.querySelector("#formMessage");
const etniaInput = document.querySelector("#etniaInput");
const etniaOptions = document.querySelector("#etniaOptions");
const etniaChips = document.querySelector("#etniaChips");
const addEtniaBtn = document.querySelector("#addEtniaBtn");
const processList = document.querySelector("#processList");
const addProcessBtn = document.querySelector("#addProcessBtn");
const removeProcessBtn = document.querySelector("#removeProcessBtn");
const estadoInput = document.querySelector("#estadoInput");
const estadoOptions = document.querySelector("#estadoOptions");
const estadoChips = document.querySelector("#estadoChips");
const addEstadoBtn = document.querySelector("#addEstadoBtn");
const municipioInput = document.querySelector("#municipioInput");
const municipioOptions = document.querySelector("#municipioOptions");
const municipioChips = document.querySelector("#municipioChips");
const addMunicipioBtn = document.querySelector("#addMunicipioBtn");

let currentStep = 0;
let selectedEtnias = [];
let selectedEstados = [];
let selectedMunicipios = [];
let municipiosPorEstado = new Map();
let allEstados = [];
let formInitialized = false;

init();

function init() {
  bindAccessEvents();

  const authorizedEmail = sessionStorage.getItem(AUTHORIZED_EMAIL_KEY);
  if (authorizedEmail) {
    showAuthorizedForm(authorizedEmail);
    return;
  }

  accessGate.hidden = false;
  formApp.hidden = true;
}

function bindAccessEvents() {
  accessForm.addEventListener("submit", handleAccessSubmit);
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
    showAccessMessage("Configure VERIFY_ACCESS_URL no arquivo config.js.", "error");
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
      sessionStorage.setItem(AUTHORIZED_EMAIL_KEY, email);
      await showAuthorizedForm(email);
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

async function showAuthorizedForm(email) {
  accessGate.hidden = true;
  formApp.hidden = false;
  await initializeForm();
  setAuthorizedEmail(email);
}

async function initializeForm() {
  if (formInitialized) return;
  formInitialized = true;
  populateEtniaOptions();
  await loadMunicipioData();
  bindEvents();
  loadDraft();
  updateConditionals();
  showStep(0);
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
  form.addEventListener("submit", handleSubmit);
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
  saveDraftBtn.addEventListener("click", saveDraft);
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

  prevBtn.hidden = currentStep === 0;
  nextBtn.hidden = currentStep === steps.length - 1;
  submitBtn.hidden = currentStep !== steps.length - 1;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goToNextStep() {
  if (!validateCurrentStep()) return;
  showStep(Math.min(currentStep + 1, steps.length - 1));
}

function goToPreviousStep() {
  showStep(Math.max(currentStep - 1, 0));
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

async function handleSubmit(event) {
  event.preventDefault();
  if (!validateCurrentStep()) return;

  const authorizedEmail = sessionStorage.getItem(AUTHORIZED_EMAIL_KEY);
  if (!authorizedEmail) {
    formApp.hidden = true;
    accessGate.hidden = false;
    showAccessMessage("Informe seu e-mail para acessar o formulário.", "error");
    return;
  }

  setAuthorizedEmail(authorizedEmail);

  if (!POWER_AUTOMATE_URL) {
    showMessage("Configure POWER_AUTOMATE_URL no arquivo config.js antes de enviar.", "error");
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

    if (response.status === 403) {
      showMessage("Este e-mail não está autorizado a enviar o formulário.", "error");
      return;
    }

    if (!response.ok) {
      throw new Error(`Falha no envio: ${response.status}`);
    }

    localStorage.removeItem(DRAFT_KEY);
    form.reset();
    setAuthorizedEmail(authorizedEmail);
    selectedEtnias = [];
    selectedEstados = [];
    selectedMunicipios = [];
    renderEtniaChips();
    renderEstadoChips();
    renderMunicipioChips();
    populateEstadoOptions();
    populateMunicipioOptions();
    updateConditionals();
    showStep(0);
    showMessage("Formulário enviado com sucesso.", "success");
  } catch (error) {
    showMessage("Não foi possível enviar o formulário. Verifique a URL do Power Automate e tente novamente.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar formulário";
  }
}

function buildPayload(statusFormulario = "Enviado") {
  return {
    tokenSecreto: SECRET_TOKEN,
    origem: "github-pages-funai",
    enviadoEm: new Date().toISOString(),
    statusFormulario,
    consultor: {
      nome: getValue("consultorNome"),
      email: getAuthorizedEmail(),
      areaEstudo: getValue("areaEstudo")
    },
    reivindicacao: {
      id: getValue("reivindicacaoId"),
      nome: getValue("nomeReivindicacao"),
      outrosNomes: getValue("outrosNomes"),
      outrosNomesTexto: getValue("outrosNomesTexto"),
      numerosProcesso: getProcessNumbers(),
      temRoteiro: getValue("temRoteiro"),
      dataRoteiro: getValue("dataRoteiro"),
      etnias: getSelectedEtnias(),
      outraEtnia: getValue("outraEtnia"),
      tipoDemanda: getCheckedValues("tipoDemanda"),
      modalidadeConstituicao: getValue("modalidadeConstituicao"),
      justificativaRevisao: getValue("justificativaRevisao"),
      estado: getSelectedEstados().join(", "),
      estados: getSelectedEstados(),
      municipio: getSelectedMunicipios().join(", "),
      municipios: getSelectedMunicipios(),
      coordenacaoRegional: getValue("coordenacaoRegional"),
      temRetomada: getValue("temRetomada"),
      detalhesRetomada: getValue("detalhesRetomada")
    },
    resumoProcesso: {
      descricao: getValue("descricaoReivindicacao"),
      dataDocumento: getValue("dataDocumento"),
      tipoDocumento: getValue("tipoDocumento"),
      paginas: getValue("paginasDocumento"),
      numeroSei: getValue("numeroSei"),
      eventosAssuntos: getValue("eventosAssuntos")
    },
    statusProcesso: {
      estaJudicializado: getValue("estaJudicializado"),
      acoesJudiciais: getCheckedValues("acoesJudiciais"),
      descricaoAcao: getValue("descricaoAcao"),
      temDecisao: getValue("temDecisao"),
      numeroDecisao: getValue("numeroDecisao"),
      dataDecisao: getValue("dataDecisao"),
      sentenca: getValue("sentenca")
    },
    caracterizacaoArea: {
      localizacaoDemanda: getValue("localizacaoDemanda"),
      temCoordenadas: getValue("temCoordenadas"),
      latitude: getValue("latitude"),
      longitude: getValue("longitude"),
      comentarioCoordenada: getValue("comentarioCoordenada"),
      bioma: getCheckedValues("bioma"),
      aldeiasComunidades: getValue("aldeiasComunidades"),
      contextoUrbano: getValue("contextoUrbano"),
      faixaFronteira: getValue("faixaFronteira"),
      sobreposicoes: getValue("sobreposicoes"),
      tiposSobreposicao: getCheckedValues("tiposSobreposicao"),
      detalheSobreposicoes: getValue("detalheSobreposicoes")
    },
    ocupacaoIndigena: {
      indigenasArea: getValue("indigenasArea"),
      tempoOcupacao: getValue("tempoOcupacao"),
      vulnerabilidades: getCheckedValues("vulnerabilidades"),
      comunidadesTradicionais: getValue("comunidadesTradicionais"),
      descricaoComunidadeTradicional: getValue("descricaoComunidadeTradicional"),
      conflitoInteretnico: getValue("conflitoInteretnico"),
      reintegracaoPosse: getValue("reintegracaoPosse")
    }
  };
}

async function saveDraft() {
  const payload = buildPayload("Rascunho");
  localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));

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

    if (response.status === 403) {
      showMessage("Este e-mail não está autorizado.", "error");
      return;
    }

    if (!response.ok) {
      throw new Error(`Falha no envio do rascunho: ${response.status}`);
    }

    showMessage("Rascunho salvo no navegador e enviado para teste.", "success");
  } catch (error) {
    showMessage("Rascunho salvo no navegador, mas não foi enviado ao SharePoint.", "error");
  } finally {
    saveDraftBtn.disabled = false;
    saveDraftBtn.textContent = "Salvar rascunho";
  }
}

function loadDraft() {
  const rawDraft = localStorage.getItem(DRAFT_KEY);
  if (!rawDraft) return;

  try {
    const draft = JSON.parse(rawDraft);
    restoreValues(flattenDraft(draft));
  } catch (error) {
    localStorage.removeItem(DRAFT_KEY);
  }
}

function restoreValues(values) {
  if (Array.isArray(values.etnias)) {
    selectedEtnias = values.etnias.filter(Boolean);
    renderEtniaChips();
  }

  if (Array.isArray(values.estados)) {
    selectedEstados = values.estados.filter(Boolean);
    renderEstadoChips();
    populateMunicipioOptions();
  }

  if (Array.isArray(values.municipios)) {
    selectedMunicipios = values.municipios.filter(Boolean);
    renderMunicipioChips();
  }

  if (Array.isArray(values.numerosProcesso)) {
    restoreProcessFields(values.numerosProcesso);
  }

  Object.entries(values).forEach(([name, value]) => {
    if (name === "etnias" || name === "estados" || name === "municipios" || name === "numerosProcesso") return;
    if (value === undefined) return;

    const element = form.elements[name];
    if (!element) return;

    const fieldList = element instanceof RadioNodeList ? Array.from(element) : [element];

    fieldList.forEach((field) => {
      if (field.type === "checkbox") {
        field.checked = Array.isArray(value) && value.includes(field.value);
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
    consultorEmail: draft.consultor?.email,
    consultorNome: draft.consultor?.nome,
    areaEstudo: draft.consultor?.areaEstudo,
    reivindicacaoId: draft.reivindicacao?.id,
    nomeReivindicacao: draft.reivindicacao?.nome,
    outrosNomes: draft.reivindicacao?.outrosNomes,
    outrosNomesTexto: draft.reivindicacao?.outrosNomesTexto,
    numerosProcesso: draft.reivindicacao?.numerosProcesso || [draft.reivindicacao?.numeroProcesso].filter(Boolean),
    temRoteiro: draft.reivindicacao?.temRoteiro,
    dataRoteiro: draft.reivindicacao?.dataRoteiro,
    etnias: draft.reivindicacao?.etnias,
    outraEtnia: draft.reivindicacao?.outraEtnia,
    tipoDemanda: draft.reivindicacao?.tipoDemanda,
    modalidadeConstituicao: draft.reivindicacao?.modalidadeConstituicao,
    justificativaRevisao: draft.reivindicacao?.justificativaRevisao,
    estados: draft.reivindicacao?.estados || splitLegacyList(draft.reivindicacao?.estado),
    municipios: draft.reivindicacao?.municipios || splitLegacyList(draft.reivindicacao?.municipio),
    coordenacaoRegional: draft.reivindicacao?.coordenacaoRegional,
    temRetomada: draft.reivindicacao?.temRetomada,
    detalhesRetomada: draft.reivindicacao?.detalhesRetomada,
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
  return sessionStorage.getItem(AUTHORIZED_EMAIL_KEY) || getValue("consultorEmail");
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
