const url = "https://raw.githubusercontent.com/morofoft/scraper/main/datos_issue.json";

const estadoPrevio = localStorage.getItem("estado_anterior");

function tiempoTranscurrido(fecha) {
    const f = new Date(fecha);
    const ahora = new Date();
    const diffMin = Math.floor((ahora - f) / 60000);

    if (diffMin < 1) return "Hace unos segundos";
    if (diffMin < 60) return `Hace ${diffMin} minutos`;
    const hrs = Math.floor(diffMin / 60);
    return `Hace ${hrs} horas`;
}

function colorBadge(estado) {
    estado = estado.toLowerCase();
    if (estado.includes("creado")) return "bg-secondary";
    if (estado.includes("enviado")) return "bg-info";
    if (estado.includes("revisión")) return "bg-warning text-dark";
    if (estado.includes("aprobado")) return "bg-success";
    if (estado.includes("rechazado")) return "bg-danger";
    return "bg-dark";
}

fetch(url)
    .then(r => r.json())
    .then(data => {

        const estadoActual = data.estado_actual || "Desconocido";

        // Estado
        document.getElementById("estado").innerHTML = estadoActual;
        document.getElementById("badgeEstado").className =
            "estado-badge text-white " + colorBadge(estadoActual);

        document.getElementById("badgeEstado").innerText = estadoActual;

        // Última actualización
        document.getElementById("ultimaActualizacion").innerText = 
            "Última actualización: " + tiempoTranscurrido(data.actualizado);

        // Alerta visual si cambió
        if (estadoPrevio && estadoPrevio !== estadoActual) {
            document.getElementById("alertaCambio").innerHTML = `
                <div class="alert alert-danger alert-change">
                    <i class="fa-solid fa-bell fa-shake"></i>
                    El estado ha cambiado.
                    <br>
                    Anterior: <b>${estadoPrevio}</b>  
                    <br>
                    Nuevo: <b>${estadoActual}</b>
                </div>
            `;
        }

        localStorage.setItem("estado_anterior", estadoActual);

        // Historial (timeline)
        let timeline = "";
        data.historial.forEach(h => {
            timeline += `
                <div class="timeline-item">
                    <div class="d-flex justify-content-between">
                        <strong>${h.numero}</strong>
                        <span class="text-muted">${h.fecha}</span>
                    </div>
                    <div class="text-primary fw-bold mt-2">${h.usuario}</div>
                    <ul class="mt-2">
                        ${h.cambios.map(c => `<li>${c}</li>`).join("")}
                    </ul>
                </div>
            `;
        });

        document.getElementById("historial").innerHTML = timeline;
    })
    .catch(() => {
        document.getElementById("estado").innerText = "Error al cargar datos.";
    });

