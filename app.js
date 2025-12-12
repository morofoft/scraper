const url = "https://raw.githubusercontent.com/morofoft/scraper/main/datos_issue.json";

const estadoPrevio = localStorage.getItem("estado_anterior");
const badgeBaseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold";

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

const ESTADO_COLORES = [
    { clave: "creado", codexclase: "bg-slate-500 text-white" },
    { clave: "enviado", clase: "bg-sky-500 text-white" },
    { clave: "revisión", clase: "bg-yellow-300 text-slate-900" },
    { clave: "revision", clase: "bg-yellow-300 text-slate-900" },
    { clave: "aprobado", clase: "bg-emerald-500 text-white" },
    { clave: "rechazado", clase: "bg-rose-500 text-white" },
    { clave: "proceso", clase: "bg-blue-600 text-white" },
    { clave: "espera", clase: "bg-gray-800 text-white" },
];

function colorBadge(estado) {
    const normalizado = estado.toLowerCase();
    const encontrado = ESTADO_COLORES.find(({ clave }) => normalizado.includes(clave));
    return encontrado ? encontrado.clase : "bg-slate-700 text-white";
}

function renderHistorial(historial) {
    if (!historial || !Array.isArray(historial) || historial.length === 0) {
        return "<p class=\"text-slate-500 italic\">No hay historial disponible.</p>";
    }

    return historial
        .map((h) => `
            <div class="relative bg-white/80 border border-slate-100 rounded-xl shadow-sm p-4">
                <span class="absolute -left-[23px] top-4 w-4 h-4 rounded-full bg-sky-500 border-4 border-white"></span>
                <div class="flex flex-wrap justify-between gap-3 text-sm text-slate-500">
                    <strong class="text-slate-900">${h.numero || "Sin número"}</strong>
                    <span>${h.fecha || "Fecha no disponible"}</span>
                </div>
                <div class="text-sky-700 font-semibold mt-1">${h.usuario || "Usuario desconocido"}</div>
                <ul class="list-disc list-inside mt-2 space-y-1 text-slate-700">
                    ${(h.cambios || []).map((c) => `<li>${c}</li>`).join("")}
                </ul>
            </div>
        `)
        .join("");
}

async function cargarDatos() {
    const estadoElemento = document.getElementById("estado");
    const badgeEstado = document.getElementById("badgeEstado");
    const ultimaActualizacion = document.getElementById("ultimaActualizacion");
    const alertaCambio = document.getElementById("alertaCambio");
    const historialElemento = document.getElementById("historial");

    estadoElemento.innerText = "Cargando datos...";
    badgeEstado.className = `${badgeBaseClasses} bg-slate-500 text-white`;

    try {
        const r = await fetch(url);
        const data = await r.json();

        const estadoActual = data.estado_actual || "Desconocido";

        estadoElemento.innerHTML = estadoActual;
        badgeEstado.className = `${badgeBaseClasses} ${colorBadge(estadoActual)}`;
        badgeEstado.innerText = estadoActual;

        const fechaActualizada = data.actualizado || "";
        ultimaActualizacion.innerText =
            fechaActualizada
                ? `Última actualización: ${tiempoTranscurrido(fechaActualizada)}`
                : "Sin fecha de actualización";
        ultimaActualizacion.title = fechaActualizada;

        if (estadoPrevio && estadoPrevio !== estadoActual) {
            alertaCambio.innerHTML = `
                <div class="border border-rose-200 bg-rose-50 text-rose-700 rounded-xl p-4 shadow-sm animate-pulse">
                    <div class="flex items-center gap-2 font-semibold">
                        <i class="fa-solid fa-bell" aria-hidden="true"></i>
                        <span>El estado ha cambiado.</span>
                    </div>
                    <div class="mt-2 text-sm">
                        Anterior: <b>${estadoPrevio}</b><br>
                        Nuevo: <b>${estadoActual}</b>
                    </div>
                </div>
            `;
        } else {
            alertaCambio.innerHTML = "";
        }

        localStorage.setItem("estado_anterior", estadoActual);

        historialElemento.innerHTML = renderHistorial(data.historial);
    } catch (error) {
        estadoElemento.innerText = "Error al cargar datos.";
        alertaCambio.innerHTML = "";
        ultimaActualizacion.innerText = "";
        historialElemento.innerHTML =
            "<p class=\"text-rose-600\">No se pudo obtener el historial. Inténtalo más tarde.</p>";
        console.error("Error cargando datos del issue", error);
    }
}

cargarDatos();
