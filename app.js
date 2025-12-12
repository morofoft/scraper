const url = "https://raw.githubusercontent.com/morofoft/scraper/main/datos_issue.json";

const badgeBaseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold";
const estadoPrevio = localStorage.getItem("estado_anterior");

// ✅ etapas (stepper)
const ETAPAS = [
  { key: "creado", label: "Propuesta", hint: "Tema definido y plan inicial" },
  { key: "enviado", label: "Envío", hint: "Documento enviado para revisión" },
  { key: "revision", label: "Revisión", hint: "Observaciones y evaluación" },
  { key: "aprobado", label: "Aprobada", hint: "Aprobación formal / listo" },
];

// ✅ colores
const ESTADO_COLORES = [
  { clave: "creado", clase: "bg-slate-600 text-white" },
  { clave: "enviado", clase: "bg-sky-600 text-white" },
  { clave: "revisión", clase: "bg-amber-300 text-slate-900" },
  { clave: "revision", clase: "bg-amber-300 text-slate-900" },
  { clave: "aprobado", clase: "bg-emerald-600 text-white" },
  { clave: "rechazado", clase: "bg-rose-600 text-white" },
  { clave: "proceso", clase: "bg-indigo-600 text-white" },
  { clave: "espera", clase: "bg-slate-900 text-white" },
];

function tiempoTranscurrido(fecha) {
  const f = new Date(fecha);
  const ahora = new Date();
  const diffMin = Math.floor((ahora - f) / 60000);

  if (Number.isNaN(diffMin)) return "Fecha desconocida";
  if (diffMin < 1) return "Hace unos segundos";
  if (diffMin < 60) return `Hace ${diffMin} minutos`;

  const hrs = Math.floor(diffMin / 60);
  if (hrs < 24) return `Hace ${hrs} horas`;

  const dias = Math.floor(hrs / 24);
  if (dias < 7) return `Hace ${dias} días`;
  const semanas = Math.floor(dias / 7);
  return `Hace ${semanas} semana${semanas > 1 ? "s" : ""}`;
}

function colorBadge(estado) {
  const normalizado = (estado || "").toLowerCase();
  const encontrado = ESTADO_COLORES.find(({ clave }) => normalizado.includes(clave));
  return encontrado ? encontrado.clase : "bg-slate-700 text-white";
}

// ✅ estado → copy humano + progreso + etapa
function interpretarEstado(estado) {
  const e = (estado || "").toLowerCase();

  if (e.includes("aprob")) return { etapaIndex: 3, progreso: 100, humano: "¡Excelente! La tesis está aprobada ✅" };
  if (e.includes("revis") ) return { etapaIndex: 2, progreso: 75, humano: "Vamos bien: está en revisión con observaciones 📝" };
  if (e.includes("envi"))  return { etapaIndex: 1, progreso: 45, humano: "Documento enviado. A la espera de revisión 🔎" };
  if (e.includes("cread")) return { etapaIndex: 0, progreso: 20, humano: "Inicio sólido: propuesta y estructura en marcha 🚀" };
  if (e.includes("rechaz"))return { etapaIndex: 2, progreso: 60, humano: "Hay ajustes pendientes. Se recomienda corregir y reenviar ⚠️" };
  if (e.includes("proceso"))return { etapaIndex: 2, progreso: 65, humano: "En proceso: avanzando con pasos firmes 💪" };
  if (e.includes("espera"))return { etapaIndex: 1, progreso: 40, humano: "En espera: pendiente de respuesta o validación ⏳" };

  return { etapaIndex: 1, progreso: 35, humano: "Estado registrado. Seguimos monitoreando 📌" };
}

function renderStepper(etapaIndex) {
  const el = document.getElementById("stepper");
  if (!el) return;

  el.innerHTML = ETAPAS.map((et, idx) => {
    const done = idx < etapaIndex;
    const current = idx === etapaIndex;

    const dot = done
      ? "bg-emerald-500"
      : current
      ? "bg-sky-500 animate-pulse"
      : "bg-slate-300 dark:bg-slate-600";

    const text = done
      ? "text-slate-900 dark:text-white"
      : current
      ? "text-slate-900 dark:text-white"
      : "text-slate-600 dark:text-slate-300";

    const badge = done
      ? "Completada"
      : current
      ? "Actual"
      : "Pendiente";

    const badgeCls = done
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
      : current
      ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
      : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";

    return `
      <li class="flex items-start gap-3">
        <span class="mt-1 h-3 w-3 rounded-full ${dot}"></span>
        <div class="flex-1">
          <div class="flex items-center justify-between gap-3">
            <p class="font-semibold ${text}">${et.label}</p>
            <span class="text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full ${badgeCls}">
              ${badge}
            </span>
          </div>
          <p class="text-xs mt-1 text-slate-500 dark:text-slate-400">${et.hint}</p>
        </div>
      </li>
    `;
  }).join("");
}

function renderHistorial(historial) {
  if (!historial || !Array.isArray(historial) || historial.length === 0) {
    return `<p class="text-slate-500 dark:text-slate-400 italic">Aún no se han registrado cambios.</p>`;
  }

  return historial.map((h, i) => {
    const usuario = h.usuario || "Responsable no indicado";
    const fecha = h.fecha || "Fecha no disponible";
    const numero = h.numero || "Movimiento";
    const cambios = (h.cambios || []).slice(0, 8);

    return `
      <article data-timeline-item
        class="relative opacity-0 translate-x-6 transition-all duration-700 ease-out
               bg-white/80 dark:bg-slate-900/30
               border border-slate-100 dark:border-slate-700/70
               rounded-2xl p-5 shadow-sm"
        style="transition-delay:${i * 110}ms">
        
        <span class="absolute -left-[30px] top-6 w-4 h-4 rounded-full bg-sky-500 border-4 border-white dark:border-slate-950"></span>

        <div class="flex flex-wrap items-center justify-between gap-2">
          <h4 class="font-bold text-slate-900 dark:text-white">${numero}</h4>
          <span class="text-xs text-slate-500 dark:text-slate-400">${fecha}</span>
        </div>

        <p class="mt-1 text-sm text-sky-700 dark:text-sky-300 font-semibold">
          <i class="fa-solid fa-user-check mr-2 opacity-80"></i>${usuario}
        </p>

        <ul class="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
          ${cambios.map(c => `<li class="flex gap-2"><span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400"></span><span>${c}</span></li>`).join("")}
        </ul>
      </article>
    `;
  }).join("");
}

function animarTimeline() {
  requestAnimationFrame(() => {
    document.querySelectorAll("[data-timeline-item]").forEach(item => {
      item.classList.remove("opacity-0", "translate-x-6");
    });
  });
}

async function cargarDatos() {
  const estadoElemento = document.getElementById("estado");
  const badgeEstado = document.getElementById("badgeEstado");
  const ultimaActualizacion = document.getElementById("ultimaActualizacion");
  const alertaCambio = document.getElementById("alertaCambio");
  const historialElemento = document.getElementById("historial");

  const progressBar = document.getElementById("progressBar");
  const progressPercent = document.getElementById("progressPercent");
  const progressText = document.getElementById("progressText");
  const estadoHumano = document.getElementById("estadoHumano");

  const kpiUltimaAccion = document.getElementById("kpiUltimaAccion");
  const kpiUltimaAccionSub = document.getElementById("kpiUltimaAccionSub");
  const kpiTotalCambios = document.getElementById("kpiTotalCambios");
  const kpiResponsable = document.getElementById("kpiResponsable");
  const kpiInactividad = document.getElementById("kpiInactividad");

  estadoElemento.innerText = "Cargando…";
  badgeEstado.className = `${badgeBaseClasses} bg-slate-600 text-white`;
  badgeEstado.innerHTML = `<i class="fa-solid fa-rotate"></i> Espera`;

  try {
    const r = await fetch(url, { cache: "no-store" });
    const data = await r.json();

    const estadoActual = data.estado_actual || "Desconocido";
    const meta = interpretarEstado(estadoActual);

    // Estado
    estadoElemento.innerText = estadoActual;
    badgeEstado.className = `${badgeBaseClasses} ${colorBadge(estadoActual)}`;
    badgeEstado.innerText = estadoActual;

    // Human copy + progress
    estadoHumano.innerText = meta.humano;
    progressText.innerText = `Etapa actual: ${ETAPAS[Math.min(meta.etapaIndex, ETAPAS.length - 1)]?.label || "Seguimiento"}`;
    progressPercent.innerText = `${meta.progreso}%`;
    progressBar.style.width = `${meta.progreso}%`;

    // Stepper
    renderStepper(meta.etapaIndex);

    // Fecha
    const fechaActualizada = data.actualizado || "";
    ultimaActualizacion.innerText = fechaActualizada
      ? `Última actualización: ${tiempoTranscurrido(fechaActualizada)}`
      : "Sin fecha de actualización";
    ultimaActualizacion.title = fechaActualizada;

    // KPIs
    const historial = Array.isArray(data.historial) ? data.historial : [];
    const last = historial[0] || historial[historial.length - 1]; // por si viene invertido
    const lastUser = (last?.usuario || "—");
    const lastFecha = (data.actualizado || last?.fecha || "");

    kpiTotalCambios.innerText = String(historial.length || 0);
    kpiResponsable.innerText = lastUser;

    const lastCambio = (last?.cambios && last.cambios[0]) ? last.cambios[0] : "Sin detalle de cambios";
    kpiUltimaAccion.innerText = lastCambio;
    kpiUltimaAccionSub.innerText = lastFecha ? `Registrado: ${tiempoTranscurrido(lastFecha)}` : "Sin fecha registrada";

    kpiInactividad.innerText = lastFecha ? tiempoTranscurrido(lastFecha) : "—";

    // Alerta cambio (premium)
    if (estadoPrevio && estadoPrevio !== estadoActual) {
      alertaCambio.innerHTML = `
        <div id="alertaCambioBox"
             class="opacity-0 translate-y-3 transition-all duration-700
                    border border-rose-200 dark:border-rose-900/60
                    bg-rose-50 dark:bg-rose-900/25
                    text-rose-700 dark:text-rose-300
                    rounded-2xl p-4 shadow-sm">
          <div class="flex items-center gap-2 font-semibold">
            <i class="fa-solid fa-bell"></i>
            <span>Actualización detectada</span>
          </div>
          <p class="mt-2 text-sm">
            Antes: <b>${estadoPrevio}</b><br>
            Ahora: <b>${estadoActual}</b>
          </p>
        </div>
      `;
      requestAnimationFrame(() => {
        document.getElementById("alertaCambioBox")?.classList.remove("opacity-0", "translate-y-3");
      });
    } else {
      alertaCambio.innerHTML = "";
    }

    localStorage.setItem("estado_anterior", estadoActual);

    // Historial (timeline animado)
    historialElemento.innerHTML = renderHistorial(historial);
    animarTimeline();

  } catch (error) {
    estadoElemento.innerText = "Error al cargar datos.";
    alertaCambio.innerHTML = "";
    ultimaActualizacion.innerText = "";
    document.getElementById("estadoHumano").innerText = "No pudimos obtener los datos. Intenta más tarde.";
    document.getElementById("historial").innerHTML =
      `<p class="text-rose-600 dark:text-rose-300">No se pudo obtener el historial. Inténtalo más tarde.</p>`;
    console.error("Error cargando datos del issue", error);
  }
}

cargarDatos();
