# Sistema de Seguimiento de Tesis  
### Ingeniería de Sistemas – Panel Académico de Control y Seguimiento

Sistema web **dark-only**, moderno y académico para el **seguimiento del proceso de trabajos de grado** (tesis), alineado con el **reglamento institucional**, enfocado en **control de estados, cumplimiento de requisitos y trazabilidad**.

## Descripción General

Este proyecto implementa un **sistema de seguimiento académico** que permite visualizar, analizar y controlar el avance de una tesis de Ingeniería de Sistemas a través de:

- **Estados formales del proceso**
- **Etapas académicas**
- **Indicadores de progreso**
- **Checklist reglamentario**
- **Historial de cambios**
- **Indicador de salud del proyecto**

El sistema consume datos desde un archivo JSON generado por un scraper externo y **no requiere backend propio**, lo que lo hace ideal como **proyecto académico, demostrativo y escalable**.

## Objetivos del Sistema

### Objetivo General
Desarrollar un sistema web que permita dar seguimiento estructurado y normativo al proceso de trabajos de grado, garantizando el cumplimiento del reglamento académico.

### Objetivos Específicos
- Normalizar los **estados del proceso de tesis**
- Visualizar el **avance académico real**
- Controlar requisitos reglamentarios mediante checklist
- Ofrecer indicadores claros para toma de decisiones
- Mantener trazabilidad completa del proceso

## Tecnologías Utilizadas

| Tecnología | Uso |
|-----------|-----|
| **HTML5** | Estructura del sistema |
| **Tailwind CSS** | Diseño UI dark-only profesional |
| **JavaScript (Vanilla)** | Lógica de negocio y renderizado |
| **Font Awesome** | Iconografía |
| **GitHub Raw JSON** | Fuente de datos |
| **LocalStorage** | Persistencia de estado previo |

## Arquitectura del Sistema

Frontend (HTML + Tailwind)
|
v
app.js (Lógica académica)
|
v
datos_issue.json (Fuente de datos)

- No existe dependencia de backend
- Arquitectura **desacoplada**
- Escalable a API o base de datos en el futuro

## Estados Formales del Proceso

El sistema **no utiliza estados genéricos**, sino **estados académicos formales**, por ejemplo:

- Tema creado | enviado | comentado | aprobado
- Anteproyecto creado | enviado | comentado | aprobado
- Tesis en desarrollo | enviada a jurado | aprobada

## Etapas del Proceso

Las etapas generales del proceso son:

1. Tema  
2. Anteproyecto  
3. Desarrollo  
4. Evaluación  
5. Final  

Estas se visualizan como un **pipeline académico**, marcando la etapa actual.

## Indicadores Académicos (KPIs)

El sistema calcula automáticamente:

- **Progreso académico (%)**
- **Responsable del último movimiento**
- **Última acción realizada**
- **Inactividad del proyecto**
- **Cantidad total de registros en historial**

## Indicador de Salud del Proyecto

Basado en la **inactividad del proceso**, el sistema clasifica el estado del proyecto como:

| Días sin cambios | Estado |
|------------------|--------|
| ≤ 7 días | 🟢 OK |
| 8 – 14 días | 🟡 Atención |
| > 14 días | 🔴 Atraso |

Este indicador permite identificar riesgos académicos tempranos.

## Historial de Cambios

Cada modificación del proceso queda registrada con:

- Número de evento
- Fecha
- Usuario
- Detalle del cambio

Esto garantiza **trazabilidad completa**, requerida por el reglamento académico.


## Diseño y UX

- **Modo oscuro único** (dark-only)
- Estilo institucional y tecnológico
- Glassmorphism sobrio
- Grid técnico de fondo
- Interfaz limpia y profesional
- Enfoque académico (no decorativo)

## Fuente de Datos

El sistema consume datos desde un archivo JSON con la siguiente estructura:

```json
{
  "actualizado": "YYYY-MM-DD HH:MM:SS",
  "estado_actual": "Anteproyecto Enviado",
  "historial": []
}
```
Esto permite integrar fácilmente:

- Scrapers
- APIs
- Backends futuros
- Escalabilidad Futura

Este sistema está preparado para evolucionar hacia:
- Validación de transiciones de estado
- Control de cronograma académico
- Gestión de jurado y defensa
- Exportación de informes PDF
- Integración con bases de datos
- Autenticación por roles (Tutor / Estudiante)

## Autor
Pedro García
Ingeniero de Sistemas
Proyecto académico – Sistema de Seguimiento de Tesis

## Licencia
Proyecto con fines académicos y educativos.
Uso libre para aprendizaje, demostración y mejora.

## Conclusión
Este proyecto no es solo un dashboard visual, sino un Sistema de Gestión Académica, diseñado bajo principios de ingeniería de sistemas, normativa institucional y buenas prácticas de desarrollo web moderno.
