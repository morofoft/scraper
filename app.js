// ==================================
// CONFIGURACIÓN
// ==================================
const url = "https://raw.githubusercontent.com/morofoft/scraper/main/datos_issue.json";
const estadoPrevio = localStorage.getItem("estado_anterior");

const badgeBaseClasses = "px-4 py-1 rounded-full text-xs font-bold text-white";

// ==================================
// ESTADOS FORMALES DEL PROCESO
// (NO solo etapas, estados oficiales)
// ==================================
const ESTADOS_FORMALES = [
  { match: ["tema creado"], codigo: "TEMA_CREADO", label: "Tema creado", etapa: "Tema", progreso: 10, color: "bg-slate-600" },
  { match: ["tema enviado"], codigo: "TEMA_ENVIADO", label: "Tema enviado", etapa: "Tema", progreso: 20, color: "bg-sky-600" },
  { match: ["tema comentado"], codigo: "TEMA_COMENTADO", label: "Tema comentado", etapa: "Tema", progreso: 25, color: "bg-amber-500" },
  { match: ["tema aceptado", "tema aprobado"], codigo: "TEMA_APROBADO", label: "Tema aprobado", etapa: "Tema", progreso: 30, color: "bg-emerald-600" },

  { match: ["anteproyecto creado"], codigo: "ANTEPROYECTO_CREADO", label: "Anteproyecto creado", etapa: "Anteproyecto", progreso: 40, color: "bg-indigo-600" },
  { match: ["anteproyecto enviado"], codigo: "ANTEPROYECTO_ENVIADO", label: "Anteproyecto enviado", etapa: "Anteproyecto", progreso: 50, color: "bg-sky-700" },
  { match: ["anteproyecto comentado"], codigo: "ANTEPROYECTO_COMENTADO", label: "Anteproyecto comentado", etapa: "Anteproyecto", progreso: 60, color: "bg-amber-600" },
  { match: ["anteproyecto aceptado", "anteproyecto aprobado"], codigo: "ANTEPROYECTO_APROBADO", label: "Anteproyecto aprobado", etapa: "Anteproyecto", progreso: 70, color: "bg-emerald-700" },

  { match: ["tesis en desarrollo"], codigo: "TESIS_DESARROLLO", label: "Tesis en desarrollo", etapa: "Desarrollo", progreso: 80, color: "bg-indigo-700" },
  { match: ["tesis enviada"], codigo: "TESIS_ENVIADA", label: "Tesis enviada a jurado", etapa: "Evaluación", progreso: 90, color: "bg-sky-800" },
  { match: ["tesis aprobada"], codigo: "TESIS_APROBADA", label: "Tesis aprobada", etapa: "Final", progreso: 100, color: "bg-emerald-800" }
];

const CHECKLIST_REGLAMENTARIO = [
    {
      id: "tema_creado",
      label: "Tema creado",
      cumple: data =>
        resolverEstadoFormal(data.estado_actual)?.codigo?.startsWith("TEMA")
    },
    {
      id: "tema_aprobado",
      label: "Tema aprobado",
      cumple: data =>
        resolverEstadoFormal(data.estado_actual)?.codigo === "TEMA_APROBADO"
        || data.historial?.some(h =>
          h.cambios?.some(c => c.toLowerCase().includes("tema aceptado"))
        )
    },
    {
      id: "anteproyecto_creado",
      label: "Anteproyecto creado",
      cumple: data =>
        data.estado_actual?.toLowerCase().includes("anteproyecto creado")
        || data.estado_actual?.toLowerCase().includes("anteproyecto enviado")
        || data.estado_actual?.toLowerCase().includes("anteproyecto aprobado")
    },
    {
      id: "anteproyecto_enviado",
      label: "Anteproyecto enviado",
      cumple: data =>
        data.estado_actual?.toLowerCase().includes("anteproyecto enviado")
        || data.estado_actual?.toLowerCase().includes("anteproyecto aprobado")
    },
    {
      id: "anteproyecto_aprobado",
      label: "Anteproyecto aprobado",
      cumple: data =>
        resolverEstadoFormal(data.estado_actual)?.codigo === "ANTEPROYECTO_APROBADO"
        || data.historial?.some(h =>
          h.cambios?.some(c => c.toLowerCase().includes("anteproyecto aceptado"))
        )
    },
    {
      id: "documentos",
      label: "Documentos requeridos cargados",
      cumple: data =>
        data.historial?.some(h =>
          h.cambios?.some(c => c.toLowerCase().includes("añadido fichero"))
        )
    },
    {
      id: "historial",
      label: "Historial de revisiones disponible",
      cumple: data =>
        Array.isArray(data.historial) && data.historial.length > 0
    }
  ];
  
// ==================================
// ETAPAS GENERALES
// ==================================
const ETAPAS_PROCESO = ["Tema", "Anteproyecto", "Desarrollo", "Evaluación", "Final"];

// ==================================
// UTILIDADES
// ==================================
function resolverEstadoFormal(texto) {
  if (!texto) return null;
  const t = texto.toLowerCase();
  return ESTADOS_FORMALES.find(e => e.match.some(m => t.includes(m)));
}

function tiempoTranscurrido(fecha) {
  const f = new Date(fecha.replace(" ", "T"));
  if (isNaN(f)) return null;
  return Math.floor((new Date() - f) / (1000 * 60 * 60 * 24));
}

// ==================================
// SALUD DEL PROYECTO
// ==================================
function calcularSalud(dias) {
  if (dias === null) return { label: "Desconocido", color: "bg-slate-600" };
  if (dias <= 7) return { label: "OK", color: "bg-emerald-600" };
  if (dias <= 14) return { label: "Atención", color: "bg-amber-500" };
  return { label: "Atraso", color: "bg-rose-600" };
}

// ==================================
// RENDER ETAPAS
// ==================================
function renderEtapas(etapaActual) {
  const stepper = document.getElementById("stepper");
  if (!stepper) return;

  stepper.innerHTML = ETAPAS_PROCESO.map(e => `
    <li class="flex items-center gap-3">
      <span class="h-3 w-3 rounded-full ${e === etapaActual ? "bg-sky-500" : "bg-slate-600"}"></span>
      <span class="${e === etapaActual ? "text-white font-semibold" : "text-slate-400"}">${e}</span>
    </li>
  `).join("");
}

// ==================================
// KPIs
// ==================================
function obtenerResponsable(historial) {
  return historial?.length ? historial[historial.length - 1].usuario : "—";
}

function obtenerUltimaAccion(historial) {
  if (!historial?.length) return { accion: "—", fecha: "—" };
  const u = historial[historial.length - 1];
  return {
    accion: u.cambios?.slice(-1)[0] || "—",
    fecha: u.fecha || "—"
  };
}

// ==================================
// HISTORIAL
// ==================================
function renderHistorial(historial) {
  if (!historial?.length) {
    return `<p class="text-slate-400 italic">No hay historial disponible.</p>`;
  }

  return historial.map(h => `
    <div class="relative pl-4">
      <span class="absolute -left-[6px] top-2 w-3 h-3 rounded-full bg-sky-500"></span>
      <div class="rounded-xl bg-black/40 border border-white/10 p-4 space-y-2">
        <div class="flex justify-between text-xs text-slate-400">
          <strong class="text-white">${h.numero}</strong>
          <span>${h.fecha}</span>
        </div>
        <div class="text-sm text-slate-300 font-semibold">${h.usuario}</div>
        <ul class="list-disc list-inside text-sm text-slate-300">
          ${h.cambios.map(c => `<li>${c}</li>`).join("")}
        </ul>
      </div>
    </div>
  `).join("");
}

// ==================================
// CARGA PRINCIPAL
// ==================================
async function cargarDatos() {
  const r = await fetch(url);
  const data = await r.json();

  const estadoFormal = resolverEstadoFormal(data.estado_actual);

  // ESTADO
  document.getElementById("estado").innerText = estadoFormal?.label || data.estado_actual;
  document.getElementById("badgeEstado").className =
    `${badgeBaseClasses} ${estadoFormal?.color || "bg-slate-600"}`;
  document.getElementById("badgeEstado").innerText = estadoFormal?.etapa || "—";

  // PROGRESO
  document.getElementById("progressBar").style.width = `${estadoFormal?.progreso || 0}%`;
  document.getElementById("progressPercent").innerText = `${estadoFormal?.progreso || 0}%`;

  // ETAPAS
  renderEtapas(estadoFormal?.etapa);

  // KPIs
  document.getElementById("kpiResponsable").innerText = obtenerResponsable(data.historial);
  document.getElementById("kpiTotalCambios").innerText = data.historial?.length || 0;

  const ultima = obtenerUltimaAccion(data.historial);
  document.getElementById("kpiUltimaAccion").innerText = ultima.accion;
  document.getElementById("kpiUltimaAccionSub").innerText = ultima.fecha;

  const dias = tiempoTranscurrido(data.actualizado);
  document.getElementById("kpiInactividad").innerText =
    dias !== null ? `Hace ${dias} días` : "—";

  // SALUD
  const salud = calcularSalud(dias);
  const saludEl = document.getElementById("saludProyecto");
  if (saludEl) {
    saludEl.innerText = salud.label;
    saludEl.className = `${badgeBaseClasses} ${salud.color}`;
  }

  // HISTORIAL
  document.getElementById("historial").innerHTML = renderHistorial(data.historial);

  localStorage.setItem("estado_anterior", data.estado_actual);

  renderChecklist(data);

}


function renderChecklist(data) {
    const contenedor = document.getElementById("checklist");
    if (!contenedor) return;
  
    contenedor.innerHTML = CHECKLIST_REGLAMENTARIO.map(item => {
      const ok = item.cumple(data);
  
      return `
        <li class="flex items-center gap-3">
          <span class="text-lg ${ok ? "text-emerald-400" : "text-rose-400"}">
            <i class="fa-solid ${ok ? "fa-circle-check" : "fa-circle-xmark"}"></i>
          </span>
          <span class="${ok ? "text-slate-200" : "text-slate-400"}">
            ${item.label}
          </span>
        </li>
      `;
    }).join("");
  }
  
// ==================================
// INIT
// ==================================
cargarDatos();
