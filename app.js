// ===============================
// CONFIGURAÇÕES
// ===============================
const AUTOMATE_URL =
  "https://defaultc18e5a39b8224257bd2a34c15bd7b4.77.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/8d7d7c22d76e4bab80ccb6c69ec213bd/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=CiMry-yaLyxnARZq1XlAZMDSjeJ7zE9szZ0tjbW-3zw";

const AUTOMATE_URL_2 =
  "https://defaultc18e5a39b8224257bd2a34c15bd7b4.77.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/54ceef6d13c64d7a8f1085e46c2cefc7/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=9KrjOvGsi9MObheaegNPDDzFYJrDu6UqwNW5ALh-y3g";

const ADMIN_PASSWORD = "stine2026";

const STORAGE_QUEUE = "stine_fila_offline";
const STORAGE_ADMIN = "stine_parametros_admin";
const STORAGE_ENVIADOS = "stine_enviados";

// ===============================
// ELEMENTOS
// ===============================
const form = document.getElementById("stineForm");

// Campos ocultos
const variedadeSojaInput = document.getElementById("variedade_soja");
const populacaoFinalSojaInput = document.getElementById("populacao_final_soja");
const hibridoMilhoInput = document.getElementById("hibrido_milho");
const pmgMilhoInput = document.getElementById("pmg_milho");
const populacaoFinalMilhoInput = document.getElementById("populacao_final_milho");

// Textos exibidos
const variedadeSojaText = document.getElementById("variedadeSojaText");
const populacaoFinalSojaText = document.getElementById("populacaoFinalSojaText");
const hibridoMilhoText = document.getElementById("hibridoMilhoText");
const pmgMilhoText = document.getElementById("pmgMilhoText");
const populacaoFinalMilhoText = document.getElementById("populacaoFinalMilhoText");

// ===============================
// FILA OFFLINE
// ===============================
function getFila() {
  return JSON.parse(localStorage.getItem(STORAGE_QUEUE) || "[]");
}
function setFila(fila) {
  localStorage.setItem(STORAGE_QUEUE, JSON.stringify(fila));
}

// ===============================
// STATUS CONEXÃO
// ===============================
function atualizarStatusConexao() {
  var online = navigator.onLine;
  var fila = getFila();

  var onlineEl = document.getElementById("onlineStatus");
  var offlineEl = document.getElementById("offlineStatus");
  var moduloOffline = document.getElementById("offlineModule");
  var contadorEl = document.getElementById("offlineCount");

  if (online) {
    onlineEl?.classList.remove("d-none");
    offlineEl?.classList.add("d-none");
  } else {
    onlineEl?.classList.add("d-none");
    offlineEl?.classList.remove("d-none");
  }

  if (contadorEl) contadorEl.innerText = fila.length;

  if (moduloOffline) {
    if (!online || fila.length > 0) moduloOffline.classList.remove("d-none");
    else moduloOffline.classList.add("d-none");
  }
}

// ===============================
// LOG LOCAL
// ===============================
function salvarLog(acao, payload, status) {
  var log = JSON.parse(localStorage.getItem("stine_log") || "[]");
  log.push({
    dataHora: new Date().toLocaleString("pt-BR", {
       timeZone: "America/Sao_Paulo"
}),
    acao, 
    status,
    nome: payload.Nome || "",
    cidade: payload.Cidade || ""
  });

  localStorage.setItem("stine_log", JSON.stringify(log));
}


// ===============================
// HASH
// ===============================
function gerarHashRegistro(payload) {
  return btoa(
    payload.Nome +
    payload.Telefone +
    payload.produtividade_sc_ha +
    payload.produtividade_milho_sc_ha
  );
}

// ===============================
// CULTURA ATIVA — controla visibilidade e required das seções
// ===============================
function aplicarCulturaAtiva(cultura) {
  var secaoSoja  = document.getElementById("secaoEstimativaSoja");
  var secaoMilho = document.getElementById("secaoEstimativaMilho");
  var paramSoja  = document.getElementById("paramSojaDisplay");
  var paramMilho = document.getElementById("paramMilhoDisplay");

  // "Ambas" é o padrão quando nenhuma cultura foi salva ainda
  var mostrarSoja  = !cultura || cultura === "Soja"  || cultura === "Ambas";
  var mostrarMilho = !cultura || cultura === "Milho" || cultura === "Ambas";

  // Mostrar / esconder seções do formulário
  if (secaoSoja)  secaoSoja.style.display  = mostrarSoja  ? "" : "none";
  if (secaoMilho) secaoMilho.style.display = mostrarMilho ? "" : "none";

  // Mostrar / esconder blocos nos parâmetros técnicos
  if (paramSoja)  paramSoja.style.display  = mostrarSoja  ? "" : "none";
  if (paramMilho) paramMilho.style.display = mostrarMilho ? "" : "none";

  // Ajustar required nos campos de soja
  ["vagens", "graos", "produtividade"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.required = mostrarSoja;
  });

  // Ajustar required nos campos de milho
  ["graos_milho", "produtividade_milho"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.required = mostrarMilho;
  });
}

// Oculta/exibe os grupos de campos no modal admin em tempo real
function alternarCamposAdmin(cultura) {
  var camposSoja  = document.getElementById("adminCamposSoja");
  var camposMilho = document.getElementById("adminCamposMilho");
  if (camposSoja)  camposSoja.style.display  = (cultura === "Milho") ? "none" : "";
  if (camposMilho) camposMilho.style.display = (cultura === "Soja")  ? "none" : "";
}

// ===============================
// ADMIN — bindings via addEventListener (compatível com iPad Safari)
// ===============================
document.addEventListener("DOMContentLoaded", function() {
  var btnAdmin          = document.getElementById("btnAdmin");
  var btnConfirmarSenha = document.getElementById("btnConfirmarSenha");
  var btnFecharSenha    = document.getElementById("btnFecharSenha");
  var btnSalvarAdmin    = document.getElementById("btnSalvarAdmin");
  var btnFecharAdmin    = document.getElementById("btnFecharAdmin");
  var senhaInput        = document.getElementById("senhaInput");

  if (btnAdmin)          btnAdmin.addEventListener("click",          abrirAdmin);
  if (btnConfirmarSenha) btnConfirmarSenha.addEventListener("click", confirmarSenha);
  if (btnFecharSenha)    btnFecharSenha.addEventListener("click",    fecharSenha);
  if (btnSalvarAdmin)    btnSalvarAdmin.addEventListener("click",    salvarAdmin);
  if (btnFecharAdmin)    btnFecharAdmin.addEventListener("click",    fecharAdmin);

  if (senhaInput) {
    senhaInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") confirmarSenha();
    });
  }
});

function abrirAdmin() {
  var senhaSection = document.getElementById("senhaSection");
  var senhaInput   = document.getElementById("senhaInput");
  var senhaErro    = document.getElementById("senhaErro");

  if (!senhaSection) return;
  if (senhaInput) senhaInput.value = "";
  if (senhaErro)  senhaErro.style.display = "none";

  senhaSection.style.display = "block";
  setTimeout(function() {
    senhaSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (senhaInput) senhaInput.focus();
  }, 50);
}

function fecharSenha() {
  var el = document.getElementById("senhaSection");
  if (el) el.style.display = "none";
}

function confirmarSenha() {
  var senhaInput = document.getElementById("senhaInput");
  var senhaErro  = document.getElementById("senhaErro");
  var senha = senhaInput ? senhaInput.value : "";

  if (senha !== ADMIN_PASSWORD) {
    if (senhaErro)  senhaErro.style.display = "block";
    if (senhaInput) { senhaInput.value = ""; senhaInput.focus(); }
    return;
  }

  var senhaSection = document.getElementById("senhaSection");
  if (senhaSection) senhaSection.style.display = "none";

  var dados = JSON.parse(localStorage.getItem(STORAGE_ADMIN) || "{}");

  var culturaEl = document.getElementById("admin_cultura");
  if (culturaEl) {
    culturaEl.value = dados.cultura || "Ambas";
    alternarCamposAdmin(culturaEl.value);
  }

  document.getElementById("admin_variedade_soja").value = dados.variedade_soja || "";
  document.getElementById("admin_pop_soja").value       = dados.populacao_final_soja || "";
  document.getElementById("admin_hibrido_milho").value  = dados.hibrido_milho || "";
  document.getElementById("admin_pmg_milho").value      = dados.pmg_milho || "";
  document.getElementById("admin_pop_milho").value      = dados.populacao_final_milho || "";

  var adminSection = document.getElementById("adminSection");
  if (adminSection) {
    adminSection.style.display = "block";
    setTimeout(function() {
      adminSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }
}

function salvarAdmin() {
  var dados = {
    cultura: document.getElementById("admin_cultura") ? document.getElementById("admin_cultura").value : "Ambas",
    variedade_soja: document.getElementById("admin_variedade_soja").value,
    populacao_final_soja: document.getElementById("admin_pop_soja").value,
    hibrido_milho: document.getElementById("admin_hibrido_milho").value,
    pmg_milho: document.getElementById("admin_pmg_milho").value,
    populacao_final_milho: document.getElementById("admin_pop_milho").value
  };

  localStorage.setItem(STORAGE_ADMIN, JSON.stringify(dados));
  carregarParametrosAdmin();
  alert("Parâmetros salvos com sucesso!");
  var adminSection = document.getElementById("adminSection");
  if (adminSection) adminSection.style.display = "none";
}

function fecharAdmin() {
  var el = document.getElementById("adminSection");
  if (el) el.style.display = "none";
}
