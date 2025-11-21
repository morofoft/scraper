// URL del JSON en GitHub
const url = "https://raw.githubusercontent.com/morofoft/scraper/main/datos_issue.json";

// Guardamos estado anterior en localStorage
const estadoPrevio = localStorage.getItem("estado_anterior");

function tiempoTranscurrido(fecha) {
    const fechaAct = new Date(fecha);
    const ahora = new Date();

    const diffMs = ahora - fechaAct;
    const min = Math.floor(diffMs / 60000);
    const horas = Math.floor(min / 60);

    if (min < 1) return "Hace unos segundos";
    if (min < 60) return `Hace ${min} minutos`;
    return `Hace ${horas} horas`;
}

fetch(url)
    .then(res => res.json())
    .then(data => {
        // ESTADO
        const estadoActual = data.estado_actual || "Desconocido";
        document.getElementById("estado").innerHTML = estadoActual;

        // ÚLTIMA ACTUALIZACIÓN
        const t = tiempoTranscurrido(data.actualizado);
        document.getElementById("ultimaActualizacion").innerText =
            `Última actualización: ${t}`;

        // ALERTA DE CAMBIO
        if (estadoPrevio && estadoPrevio !== estadoActual) {
            document.getElementById("alertaCambio").innerHTML = `
                <div class="alert alert-danger alert-change mt-3">
                    ⚠️ <strong>El estado ha cambiado:</strong><br>
                    Antes: <b>${estadoPrevio}</b><br>
                    Ahora: <b>${estadoActual}</b>
                </div>
            `;
        }

        // Guardar para la próxima vez
        localStorage.setItem("estado_anterior", estadoActual);

        // HISTORIAL
        let html = "";
        data.historial.forEach(item => {
            html += `
                <div class="history-item">
                    <div class="d-flex justify-content-between">
                        <strong>${item.numero}</strong>
                        <span class="text-muted">${item.fecha}</span>
                    </div>
                    <div class="mt-2"><strong>${item.usuario}</strong></div>
                    <ul class="mt-2">
                        ${item.cambios.map(c => `<li>${c}</li>`).join("")}
                    </ul>
                </div>
            `;
        });

        document.getElementById("historial").innerHTML = html;
    })
    .catch(err => {
        document.getElementById("estado").innerText = "Error al cargar datos.";
        console.error(err);
    });

