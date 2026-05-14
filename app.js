// ===============================
// CONFIGURAÇÕES
// ===============================
const AUTOMATE_URL =
  "https://defaultc18e5a39b8224257bd2a34c15bd7b4.77.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/8d7d7c22d76e4bab80ccb6c69ec213bd/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=CiMry-yaLyxnARZq1XlAZMDSjeJ7zE9szZ0tjbW-3zw";

const LOCAL_EVENTO = "Agrobrasilia";

const ADMIN_PASSWORD = "stine2026";

const STORAGE_QUEUE    = "stine_fila_offline";
const STORAGE_ADMIN    = "stine_parametros_admin";
const STORAGE_ENVIADOS = "stine_enviados";

// ===============================
// ELEMENTOS
// ===============================
const form = document.getElementById("stineForm");

const variedadeSojaInput      = document.getElementById("variedade_soja");
const populacaoFinalSojaInput = document.getElementById("populacao_final_soja");
const hibridoMilhoInput       = document.getElementById("hibrido_milho");
const pmgMilhoInput           = document.getElementById("pmg_milho");
const populacaoFinalMilhoInput = document.getElementById("populacao_final_milho");

const variedadeSojaText       = document.getElementById("variedadeSojaText");
const populacaoFinalSojaText  = document.getElementById("populacaoFinalSojaText");
const hibridoMilhoText        = document.getElementById("hibridoMilhoText");
const pmgMilhoText            = document.getElementById("pmgMilhoText");
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

  var onlineEl     = document.getElementById("onlineStatus");
  var offlineEl    = document.getElementById("offlineStatus");
  var moduloOffline = document.getElementById("offlineModule");
  var contadorEl   = document.getElementById("offlineCount");

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
    dataHora: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
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
// CULTURA ATIVA
// ===============================
function aplicarCulturaAtiva(cultura) {
  var secaoSoja  = document.getElementById("secaoEstimativaSoja");
  var secaoMilho = document.getElementById("secaoEstimativaMilho");
  var paramSoja  = document.getElementById("paramSojaDisplay");
  var paramMilho = document.getElementById("paramMilhoDisplay");

  var mostrarSoja  = !cultura || cultura === "Soja"  || cultura === "Ambas";
  var mostrarMilho = !cultura || cultura === "Milho" || cultura === "Ambas";

  if (secaoSoja)  secaoSoja.style.display  = mostrarSoja  ? "" : "none";
  if (secaoMilho) secaoMilho.style.display = mostrarMilho ? "" : "none";
  if (paramSoja)  paramSoja.style.display  = mostrarSoja  ? "" : "none";
  if (paramMilho) paramMilho.style.display = mostrarMilho ? "" : "none";

  ["vagens", "graos", "produtividade"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.required = mostrarSoja;
  });

  ["graos_milho", "produtividade_milho"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.required = mostrarMilho;
  });
}

function alternarCamposAdmin(cultura) {
  var camposSoja  = document.getElementById("adminCamposSoja");
  var camposMilho = document.getElementById("adminCamposMilho");
  if (camposSoja)  camposSoja.style.display  = (cultura === "Milho") ? "none" : "";
  if (camposMilho) camposMilho.style.display = (cultura === "Soja")  ? "none" : "";
}

// ===============================
// ADMIN — funções
// ===============================
function abrirAdmin() {
  var senhaSection = document.getElementById("senhaSection");
  var senhaInput   = document.getElementById("senhaInput");
  var senhaErro    = document.getElementById("senhaErro");

  if (!senhaSection) return;

  if (senhaInput) senhaInput.value = "";
  if (senhaErro)  senhaErro.style.display = "none";

  // Garante que adminSection está fechado ao abrir senha
  var adminSection = document.getElementById("adminSection");
  if (adminSection) adminSection.style.display = "none";

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

  // Fecha seção de senha
  var senhaSection = document.getElementById("senhaSection");
  if (senhaSection) senhaSection.style.display = "none";

  // Carrega valores salvos nos campos
  var dados = JSON.parse(localStorage.getItem(STORAGE_ADMIN) || "{}");

  var culturaEl = document.getElementById("admin_cultura");
  if (culturaEl) {
    culturaEl.value = dados.cultura || "Ambas";
    alternarCamposAdmin(culturaEl.value);
  }

  var elVarSoja = document.getElementById("admin_variedade_soja");
  var elPopSoja = document.getElementById("admin_pop_soja");
  var elHib     = document.getElementById("admin_hibrido_milho");
  var elPmg     = document.getElementById("admin_pmg_milho");
  var elPopMilho = document.getElementById("admin_pop_milho");
  var msgSucesso = document.getElementById("msgAdminSucesso");

  if (elVarSoja)  elVarSoja.value  = dados.variedade_soja      || "";
  if (elPopSoja)  elPopSoja.value  = dados.populacao_final_soja || "";
  if (elHib)      elHib.value      = dados.hibrido_milho        || "";
  if (elPmg)      elPmg.value      = dados.pmg_milho            || "";
  if (elPopMilho) elPopMilho.value = dados.populacao_final_milho || "";
  if (msgSucesso) msgSucesso.style.display = "none";

  // Abre seção admin
  var adminSection = document.getElementById("adminSection");
  if (adminSection) {
    adminSection.style.display = "block";
    setTimeout(function() {
      adminSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }
}

function salvarAdmin() {
  var culturaEl  = document.getElementById("admin_cultura");
  var elVarSoja  = document.getElementById("admin_variedade_soja");
  var elPopSoja  = document.getElementById("admin_pop_soja");
  var elHib      = document.getElementById("admin_hibrido_milho");
  var elPmg      = document.getElementById("admin_pmg_milho");
  var elPopMilho = document.getElementById("admin_pop_milho");

  var dados = {
    cultura:              culturaEl  ? culturaEl.value  : "Ambas",
    variedade_soja:       elVarSoja  ? elVarSoja.value  : "",
    populacao_final_soja: elPopSoja  ? elPopSoja.value  : "",
    hibrido_milho:        elHib      ? elHib.value      : "",
    pmg_milho:            elPmg      ? elPmg.value      : "",
    populacao_final_milho: elPopMilho ? elPopMilho.value : ""
  };

  localStorage.setItem(STORAGE_ADMIN, JSON.stringify(dados));
  carregarParametrosAdmin();

  // Feedback visual inline — sem alert() (bloqueado no iPad PWA)
  var msgSucesso = document.getElementById("msgAdminSucesso");
  if (msgSucesso) {
    msgSucesso.style.display = "block";
    setTimeout(function() {
      msgSucesso.style.display = "none";
      var adminSection = document.getElementById("adminSection");
      if (adminSection) adminSection.style.display = "none";
    }, 1500);
  } else {
    var adminSection = document.getElementById("adminSection");
    if (adminSection) adminSection.style.display = "none";
  }
}

function fecharAdmin() {
  var el = document.getElementById("adminSection");
  if (el) el.style.display = "none";
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
  var btnSincronizar    = document.getElementById("btnSincronizar");
  var senhaInput        = document.getElementById("senhaInput");
  var admin_cultura     = document.getElementById("admin_cultura");

  if (btnAdmin)          btnAdmin.addEventListener("click",          abrirAdmin);
  if (btnConfirmarSenha) btnConfirmarSenha.addEventListener("click", confirmarSenha);
  if (btnFecharSenha)    btnFecharSenha.addEventListener("click",    fecharSenha);
  if (btnSalvarAdmin)    btnSalvarAdmin.addEventListener("click",    salvarAdmin);
  if (btnFecharAdmin)    btnFecharAdmin.addEventListener("click",    fecharAdmin);
  if (btnSincronizar)    btnSincronizar.addEventListener("click",    sincronizarOffline);

  // Enter no campo de senha confirma
  if (senhaInput) {
    senhaInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") confirmarSenha();
    });
  }

  // Troca de cultura no select do admin
  if (admin_cultura) {
    admin_cultura.addEventListener("change", function() {
      alternarCamposAdmin(this.value);
    });
  }
});

// ===============================
// CARREGAR PARÂMETROS ADMIN
// ===============================
function carregarParametrosAdmin() {
  var dados = JSON.parse(localStorage.getItem(STORAGE_ADMIN) || "{}");

  if (dados.variedade_soja) {
    variedadeSojaInput.value = dados.variedade_soja;
    variedadeSojaText.innerText = dados.variedade_soja;
  }
  if (dados.populacao_final_soja) {
    populacaoFinalSojaInput.value = dados.populacao_final_soja;
    populacaoFinalSojaText.innerText = dados.populacao_final_soja;
  }
  if (dados.hibrido_milho) {
    hibridoMilhoInput.value = dados.hibrido_milho;
    hibridoMilhoText.innerText = dados.hibrido_milho;
  }
  if (dados.pmg_milho) {
    pmgMilhoInput.value = dados.pmg_milho;
    pmgMilhoText.innerText = dados.pmg_milho;
  }
  if (dados.populacao_final_milho) {
    populacaoFinalMilhoInput.value = dados.populacao_final_milho;
    populacaoFinalMilhoText.innerText = dados.populacao_final_milho;
  }

  aplicarCulturaAtiva(dados.cultura || "Ambas");
}

// ===============================
// ENVIO
// ===============================
async function enviarPayload(payload) {
  var r = await fetch(AUTOMATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error("Erro HTTP " + r.status);
}

// ===============================
// LIMPEZA DO FORMULÁRIO
// ===============================
function limparFormularioPreservandoAdmin() {
  var variedadeSoja  = variedadeSojaInput.value;
  var populacaoSoja  = populacaoFinalSojaInput.value;
  var hibridoMilho   = hibridoMilhoInput.value;
  var pmgMilho       = pmgMilhoInput.value;
  var populacaoMilho = populacaoFinalMilhoInput.value;

  form.reset();

  // Limpeza explícita dos campos de estimativa
  ["vagens", "graos", "produtividade", "graos_milho", "produtividade_milho"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = "";
  });

  // Restaura parâmetros técnicos
  variedadeSojaInput.value       = variedadeSoja;
  populacaoFinalSojaInput.value  = populacaoSoja;
  hibridoMilhoInput.value        = hibridoMilho;
  pmgMilhoInput.value            = pmgMilho;
  populacaoFinalMilhoInput.value = populacaoMilho;

  variedadeSojaText.innerText       = variedadeSoja;
  populacaoFinalSojaText.innerText  = populacaoSoja;
  hibridoMilhoText.innerText        = hibridoMilho;
  pmgMilhoText.innerText            = pmgMilho;
  populacaoFinalMilhoText.innerText = populacaoMilho;
}

// ===============================
// SUBMIT
// ===============================
if (form) {
  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    var payload = {
      DataHora: new Date().toISOString(),
      Local: LOCAL_EVENTO,

      Segue_Redes:   form.segue ? form.segue.value : "",
      Aceite_LGPD:   form.lgpd && form.lgpd.checked ? "Sim" : "Não",

      Nome:          form.nome.value,
      Cargo:         form.cargo   ? form.cargo.value   : "",
      empresa_fazenda: form.empresa ? form.empresa.value : "",

      Telefone: form.telefone.value,
      Email:    form.email.value,
      Cidade:   form.cidade.value,
      UF:       form.uf.value,
      Area_Soja_ha: form.area.value,

      planta_stine:       form.planta_stine       ? form.planta_stine.value       : "",
      qual_stine:         form.qual_stine         ? form.qual_stine.value         : "",
      fornecedor_semente: form.fornecedor_semente ? form.fornecedor_semente.value : "",

      // SOJA
      variedade_soja:       variedadeSojaInput.value,
      populacao_final_soja: populacaoFinalSojaInput.value,
      vagens_planta:        form.vagens.value,
      graos_vagem:          form.graos.value,
      produtividade_sc_ha:  form.produtividade.value,

      // MILHO
      hibrido_milho:          hibridoMilhoInput.value,
      pmg_milho:              pmgMilhoInput.value,
      populacao_final_milho:  populacaoFinalMilhoInput.value,
      graos_espiga_milho:     form.graos_milho        ? form.graos_milho.value        : "",
      produtividade_milho_sc_ha: form.produtividade_milho ? form.produtividade_milho.value : ""
    };

    var hash = gerarHashRegistro(payload);
    var enviados = JSON.parse(localStorage.getItem(STORAGE_ENVIADOS) || "[]");

    if (enviados.includes(hash)) {
      alert("Este registro já foi enviado.");
      return;
    }

    var fila = getFila();

    try {
      if (navigator.onLine) {
        await enviarPayload(payload);
        enviados.push(hash);
        localStorage.setItem(STORAGE_ENVIADOS, JSON.stringify(enviados));
        salvarLog("enviado", payload, "ok");
        alert("Participação enviada com sucesso!");
      } else {
        fila.push({ hash: hash, payload: payload });
        setFila(fila);
        salvarLog("salvo_offline", payload, "pendente");
        alert("Sem internet. Dados salvos localmente.");
      }
    } catch (erro) {
      console.error("Erro no envio (submit):", erro);
      fila.push({ hash: hash, payload: payload });
      setFila(fila);
      salvarLog("salvo_offline", payload, "pendente");
      alert("Falha no envio. Registro salvo offline.");
    }

    limparFormularioPreservandoAdmin();
    atualizarStatusConexao();
  });
}

// ===============================
// ENVIO AUTOMÁTICO
// ===============================
async function enviarFilaAutomatico() {
  if (!navigator.onLine) return;

  var fila = getFila();
  if (fila.length === 0) return;

  var enviados = JSON.parse(localStorage.getItem(STORAGE_ENVIADOS) || "[]");
  var restante = [];
  var qtdEnviados = 0;

  for (var i = 0; i < fila.length; i++) {
    var item = fila[i];
    try {
      if (!item.payload.graos_espiga_milho)     item.payload.graos_espiga_milho = "";
      if (!item.payload.produtividade_milho_sc_ha) item.payload.produtividade_milho_sc_ha = "";

      await enviarPayload(item.payload);
      await new Promise(r => setTimeout(r, 300));

      enviados.push(item.hash);
      salvarLog("enviado", item.payload, "ok");
      qtdEnviados++;
    } catch (erro) {
      console.error("Erro fila automática:", erro);
      restante.push(item);
    }
  }

  localStorage.setItem(STORAGE_ENVIADOS, JSON.stringify(enviados));
  setFila(restante);
  atualizarStatusConexao();

  if (qtdEnviados > 0) {
    if (restante.length === 0) {
      alert("Sincronizado! " + qtdEnviados + " cadastro(s) enviado(s).");
    } else {
      alert("Parcial: " + qtdEnviados + " enviado(s), " + restante.length + " pendente(s).");
    }
  }
}

// ===============================
// SINCRONIZAÇÃO MANUAL
// ===============================
async function sincronizarOffline() {
  if (!navigator.onLine) { alert("Sem conexão com a internet."); return; }

  var fila = getFila();
  if (fila.length === 0) { alert("Nenhum cadastro offline para sincronizar."); return; }

  var enviados = JSON.parse(localStorage.getItem(STORAGE_ENVIADOS) || "[]");
  var restante = [];
  var qtdEnviados = 0;

  for (var i = 0; i < fila.length; i++) {
    var item = fila[i];
    try {
      if (!item.payload.graos_espiga_milho)     item.payload.graos_espiga_milho = "";
      if (!item.payload.produtividade_milho_sc_ha) item.payload.produtividade_milho_sc_ha = "";

      await enviarPayload(item.payload);
      await new Promise(r => setTimeout(r, 300));

      enviados.push(item.hash);
      salvarLog("enviado", item.payload, "ok");
      qtdEnviados++;
    } catch (erroEnvio) {
      console.error("Erro sincronização manual:", erroEnvio);
      restante.push(item);
    }
  }

  localStorage.setItem(STORAGE_ENVIADOS, JSON.stringify(enviados));
  setFila(restante);

  var contadorEl = document.getElementById("offlineCount");
  if (contadorEl) contadorEl.innerText = restante.length;

  var moduloOffline = document.getElementById("offlineModule");
  if (restante.length === 0 && moduloOffline) moduloOffline.classList.add("d-none");

  atualizarStatusConexao();

  if (restante.length === 0) {
    alert("Sincronizado! " + qtdEnviados + " cadastro(s) enviado(s).");
  } else {
    alert("Parcial: " + qtdEnviados + " enviado(s), " + restante.length + " pendente(s).");
  }
}

window.sincronizarOffline = sincronizarOffline;

// ===============================
// LISTENERS ONLINE/OFFLINE
// ===============================
window.addEventListener("online",  function() { enviarFilaAutomatico(); atualizarStatusConexao(); });
window.addEventListener("offline", function() { atualizarStatusConexao(); });

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", function() {
  carregarParametrosAdmin();
  enviarFilaAutomatico();
  atualizarStatusConexao();
});

// ===============================
// MÁSCARA TELEFONE
// ===============================
document.addEventListener("DOMContentLoaded", function() {
  var telefoneInput = document.getElementById("telefone");
  if (!telefoneInput) return;

  telefoneInput.addEventListener("input", function() {
    var v = telefoneInput.value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);

    if (v.length > 6) {
      telefoneInput.value = "(" + v.slice(0,2) + ")" + v.slice(2,7) + "-" + v.slice(7);
    } else if (v.length > 2) {
      telefoneInput.value = "(" + v.slice(0,2) + ")" + v.slice(2);
    } else if (v.length > 0) {
      telefoneInput.value = "(" + v;
    } else {
      telefoneInput.value = "";
    }
  });

  telefoneInput.addEventListener("keypress", function(e) {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  });
});
