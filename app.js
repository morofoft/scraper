const url = "https://raw.githubusercontent.com/morofoft/scraper/main/datos_issue.json";

const estadoPrevio = localStorage.getItem("estado_anterior");

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
    { clave: "creado", clase: "bg-secondary" },
    { clave: "enviado", clase: "bg-info" },
    { clave: "revisión", clase: "bg-warning text-dark" },
    { clave: "revision", clase: "bg-warning text-dark" },
    { clave: "aprobado", clase: "bg-success" },
    { clave: "rechazado", clase: "bg-danger" },
    { clave: "proceso", clase: "bg-primary" },
    { clave: "espera", clase: "bg-dark" },
];

function colorBadge(estado) {
    const normalizado = estado.toLowerCase();
    const encontrado = ESTADO_COLORES.find(({ clave }) => normalizado.includes(clave));
    return encontrado ? encontrado.clase : "bg-dark";
}

function renderHistorial(historial) {
    if (!historial || !Array.isArray(historial) || historial.length === 0) {
        return "<p class=\"text-muted\">No hay historial disponible.</p>";
    }

    return historial
        .map((h) => `
            <div class="timeline-item">
                <div class="d-flex justify-content-between flex-wrap">
                    <strong>${h.numero || "Sin número"}</strong>
                    <span class="text-muted">${h.fecha || "Fecha no disponible"}</span>
                </div>
                <div class="text-primary fw-bold mt-2">${h.usuario || "Usuario desconocido"}</div>
                <ul class="mt-2">
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
    badgeEstado.className = "estado-badge bg-secondary text-white";

    try {
        const r = await fetch(url);
        const data = await r.json();

        const estadoActual = data.estado_actual || "Desconocido";

        estadoElemento.innerHTML = estadoActual;
        badgeEstado.className = `estado-badge text-white ${colorBadge(estadoActual)}`;
        badgeEstado.innerText = estadoActual;

        const fechaActualizada = data.actualizado || "";
        ultimaActualizacion.innerText =
            fechaActualizada
                ? `Última actualización: ${tiempoTranscurrido(fechaActualizada)}`
                : "Sin fecha de actualización";
        ultimaActualizacion.title = fechaActualizada;

        if (estadoPrevio && estadoPrevio !== estadoActual) {
            alertaCambio.innerHTML = `
                <div class="alert alert-danger alert-change" role="alert">
                    <i class="fa-solid fa-bell fa-shake" aria-hidden="true"></i>
                    El estado ha cambiado.
                    <br>
                    Anterior: <b>${estadoPrevio}</b>
                    <br>
                    Nuevo: <b>${estadoActual}</b>
                </div>
            `;
        }

        localStorage.setItem("estado_anterior", estadoActual);

        historialElemento.innerHTML = renderHistorial(data.historial);
    } catch (error) {
        estadoElemento.innerText = "Error al cargar datos.";
        alertaCambio.innerHTML = "";
        ultimaActualizacion.innerText = "";
        historialElemento.innerHTML =
            "<p class=\"text-danger\">No se pudo obtener el historial. Inténtalo más tarde.</p>";
        console.error("Error cargando datos del issue", error);
    }
}

cargarDatos();
