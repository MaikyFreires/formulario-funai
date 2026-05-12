const POWER_AUTOMATE_URL = "";
const URL_ACCESS_TOKEN = "FUNAI2026";
const SECRET_TOKEN = "FUNAI_FORM_SECRET_2026";
const DRAFT_KEY = "funai-form-draft";

const formApp = document.querySelector("#formApp");
const accessDenied = document.querySelector("#accessDenied");
const form = document.querySelector("#funaiForm");
const steps = Array.from(document.querySelectorAll(".step"));
const progressBar = document.querySelector("#progressBar");
const progressTitle = document.querySelector("#progressTitle");
const progressPercent = document.querySelector("#progressPercent");
const stepCounter = document.querySelector("#stepCounter");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const submitBtn = document.querySelector("#submitBtn");
const saveDraftBtn = document.querySelector("#saveDraftBtn");
const messageBox = document.querySelector("#formMessage");

let currentStep = 0;

init();

function init() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token !== URL_ACCESS_TOKEN) {
    accessDenied.hidden = false;
    return;
  }

  formApp.hidden = false;
  bindEvents();
  loadDraft();
  updateConditionals();
  showStep(0);
}

function bindEvents() {
  form.addEventListener("input", handleFormChange);
  form.addEventListener("change", handleFormChange);
  form.addEventListener("submit", handleSubmit);
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
  progressPercent.textContent = `${progress}%`;
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
  setConditional("numeroProcessoWrap", getValue("possuiProcesso") === "Sim", ["numeroProcesso"]);
  setConditional("dataRoteiroWrap", getValue("temRoteiro") === "Sim", ["dataRoteiro"]);
  setConditional("judicializadoDetalhes", getValue("estaJudicializado") === "Sim");
  setConditional("decisaoDetalhes", getValue("temDecisao") === "Sim");
  setConditional("coordenadasWrap", getValue("temCoordenadas") === "Sim");
  setConditional("sobreposicoesWrap", getValue("sobreposicoes") === "Sim");
  setConditional("indigenasAreaWrap", getValue("indigenasArea") === "Sim");
  setConditional("comunidadesTradicionaisWrap", getValue("comunidadesTradicionais") === "Sim");

  const demandas = getCheckedValues("tipoDemanda");
  setConditional("modalidadeReservaWrap", demandas.includes("Reserva Indígena"), ["modalidadeConstituicao"]);
  setConditional("justificativaRevisaoWrap", demandas.includes("Revisão de limites"), ["justificativaRevisao"]);
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

  if (!POWER_AUTOMATE_URL) {
    showMessage("Configure a constante POWER_AUTOMATE_URL no arquivo script.js antes de enviar.", "error");
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
      body: JSON.stringify(buildPayload())
    });

    if (!response.ok) {
      throw new Error(`Falha no envio: ${response.status}`);
    }

    localStorage.removeItem(DRAFT_KEY);
    form.reset();
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

function buildPayload() {
  return {
    tokenSecreto: SECRET_TOKEN,
    origem: "github-pages-funai",
    enviadoEm: new Date().toISOString(),
    consultor: {
      nome: getValue("consultorNome"),
      genero: getValue("genero"),
      areaEstudo: getValue("areaEstudo"),
      regiaoTrabalho: getValue("regiaoTrabalho")
    },
    reivindicacao: {
      id: getValue("reivindicacaoId"),
      nome: getValue("nomeReivindicacao"),
      outrosNomes: getValue("outrosNomes"),
      outrosNomesTexto: getValue("outrosNomesTexto"),
      possuiProcesso: getValue("possuiProcesso"),
      numeroProcesso: getValue("numeroProcesso"),
      temRoteiro: getValue("temRoteiro"),
      dataRoteiro: getValue("dataRoteiro"),
      etnias: getValue("etnias"),
      tipoDemanda: getCheckedValues("tipoDemanda"),
      modalidadeConstituicao: getValue("modalidadeConstituicao"),
      justificativaRevisao: getValue("justificativaRevisao"),
      coordenacaoRegional: getValue("coordenacaoRegional"),
      estado: getValue("estado"),
      municipio: getValue("municipio"),
      temRetomada: getValue("temRetomada")
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

function saveDraft() {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(buildPayload()));
  showMessage("Rascunho salvo neste navegador.", "success");
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
  Object.entries(values).forEach(([name, value]) => {
    const element = form.elements[name];
    if (!element) return;

    const fieldList = element instanceof RadioNodeList ? Array.from(element) : [element];

    fieldList.forEach((field) => {
      if (field.type === "checkbox") {
        field.checked = Array.isArray(value) && value.includes(field.value);
      } else {
        field.value = value || "";
      }
    });
  });
}

function flattenDraft(draft) {
  return {
    consultorNome: draft.consultor?.nome,
    genero: draft.consultor?.genero,
    areaEstudo: draft.consultor?.areaEstudo,
    regiaoTrabalho: draft.consultor?.regiaoTrabalho,
    reivindicacaoId: draft.reivindicacao?.id,
    nomeReivindicacao: draft.reivindicacao?.nome,
    outrosNomes: draft.reivindicacao?.outrosNomes,
    outrosNomesTexto: draft.reivindicacao?.outrosNomesTexto,
    possuiProcesso: draft.reivindicacao?.possuiProcesso,
    numeroProcesso: draft.reivindicacao?.numeroProcesso,
    temRoteiro: draft.reivindicacao?.temRoteiro,
    dataRoteiro: draft.reivindicacao?.dataRoteiro,
    etnias: draft.reivindicacao?.etnias,
    tipoDemanda: draft.reivindicacao?.tipoDemanda,
    modalidadeConstituicao: draft.reivindicacao?.modalidadeConstituicao,
    justificativaRevisao: draft.reivindicacao?.justificativaRevisao,
    coordenacaoRegional: draft.reivindicacao?.coordenacaoRegional,
    estado: draft.reivindicacao?.estado,
    municipio: draft.reivindicacao?.municipio,
    temRetomada: draft.reivindicacao?.temRetomada,
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

function getValue(name) {
  const field = form.elements[name];
  if (!field) return "";
  return String(field.value || "").trim();
}

function getCheckedValues(name) {
  return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((field) => field.value);
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
