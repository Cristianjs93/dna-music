# Análisis Técnico de Performance

## Contexto

Un módulo usado por asesores de admisiones para consultar las citas del día está tardando entre **6 y 10 segundos** en cargar. Los usuarios ya están reportando el problema. Antes de tocar una sola línea de código, el objetivo es **entender dónde se va el tiempo** y descartar hipótesis con datos, no con intuición.

A continuación describo el procedimiento que seguiría como desarrollador al recibir este ticket.

---

## Plan de diagnóstico

### 1. Reproducir el problema y recopilar contexto con el equipo

Lo primero no es abrir el IDE: es **reproducir la lentitud de forma consistente** y entender en qué condiciones ocurre.

Le pediría al equipo de soporte o a los asesores que reportaron el caso:

- ¿La lentitud pasa **siempre** o solo a ciertas horas (por ejemplo, inicio de jornada)?
- ¿Afecta a **todos los usuarios** o solo a algunos (sede, rol, navegador)?
- ¿Cuántas citas suele haber en pantalla cuando se pone lento?
- ¿El retraso se nota al **abrir la pantalla**, al **cambiar de fecha**, al **filtrar**, o al **hacer scroll**?
- ¿Desde cuándo empezó y hubo algún deploy o cambio de datos reciente?

Con eso ya puedo acotar si parece un problema de **volumen de datos**, de **concurrencia en horario pico**, o de un **flujo específico** de la UI. Si no puedo reproducirlo, ya se que va a ser un camino muy dificil.

### 2. Medir el tiempo total en el navegador

Con el caso reproducido, abro **DevTools → Network** y recargo la vista de citas del día.

Aquí busco tres cosas:

1. **Tiempo total hasta que la pantalla es usable** (no solo el spinner que desaparece).
2. **Peticiones** Cuántas llamadas se hacen, si van en serie o en paralelo, y cuál es la más lenta.
3. **TTFB** (Time To First Byte) de la petición principal frente al tiempo total de descarga.

En esta etapa considero utiles las siguientes herramientas: Chrome DevTools y si hay frontend instrumentado, **Web Vitals** o un RUM básico (Sentry, Datadog RUM, etc.).

### 3. Separar frontend, backend y red

Con la medición anterior, se pueden plantear las siguientes hipotesis:

| Síntoma                                      | Hipótesis principal                   |
| -------------------------------------------- | ------------------------------------- |
| TTFB alto en la API de citas                 | Backend o DB                          |
| TTFB bajo, pero muchas peticiones pequeñas   | Posible N+1 o renderizado en Frontend |
| Una sola petición lenta con respuesta grande | Query pesada                          |
| API rápida, UI lenta                         | Procesamiento/render en cliente       |

Para confirmar la parte de red, haria la misma petición con **curl o Postman**. Si curl tarda lo mismo que el navegador, descarto problemas de CDN o CORS como causa principal. Si curl es rápido y el navegador no, reviso autenticación, retries, o lógica del cliente.

### 4. Instrumentar y revisar el backend con trazas y logs

Pasando al servidor, necesito ver **qué hace la API por dentro** durante esos 6–10 segundos.

Revisaría:

- **Logs estructurados** de la ruta que lista citas del día.
- **Tracing** Datadog, OpenTelemetry, o incluso logs con `durationMs` por capa para ver si el tiempo se va en:
  - middleware de autenticación,
  - lógica de negocio,
  - acceso a base de datos,
  - llamadas a servicios externos.

Si no hay APM, como mínimo activaría temporalmente logs de duración en el handler y en el servicio que arma la respuesta. La meta es saber el tiempo que toma cada proceso en el flujo: _auth 50 ms → query 7 800 ms → mapeo DTO 120 ms_.

### 5. Analizar la base de datos: queries lentas, índices y N+1

Cuando el backend muestra que la DB consume la mayor parte del tiempo, bajo un nivel más.

Haría lo siguiente:

1. **Identificar la query exacta** ORM con logging de SQL o `log_queries` en Postgres.
2. Ejecutar **`EXPLAIN (ANALYZE, BUFFERS)`** sobre esa consulta con los mismos filtros que usa el asesor (fecha de hoy, sede, estado, etc.).
3. Buscar señales de:
   - Tablas grandes sin índice adecuado.
   - Loops con muchísimas iteraciones.
   - N+1 queries para la lista de citas y luego una query por cada cita para traer paciente, asesor, sede, etc.

El N+1 es muy común en listados con relaciones. En los logs vería algo como 1 `SELECT` inicial + 200 `SELECT` pequeños. Eso explica tiempos de varios segundos sin que una sola query parezca "lenta" en aislamiento.

También revisaría conexiones al pool, pues si se satura, las peticiones esperan conexión libre y parece lentitud generalizada.

### 6. Descartar problemas de infraestructura

Si los tiempos varían mucho sin cambiar la query, miraría la **capa de infra**:

- **CPU y memoria** del servicio de API y de la base de datos en el momento del incidente.
- **Disco** si la DB está en un plan limitado o con almacenamiento compartido.
- **Límites del proveedor** (conexiones máximas, throttling, cold start en serverless).
- **Latencia de red** entre API y DB si están en regiones distintas.

Herramientas típicas: dashboard del cloud (Render, AWS, Neon, etc.), métricas de Postgres (`pg_stat_activity`, conexiones activas, locks), y alertas de saturación. Si CPU está al 90% o hay queries bloqueadas por locks (redlock de redis).

### 7. Consolidar hallazgos y definir la hipótesis más probable

Con toda la información anterior, documentaría un resumen corto para el equipo:

- **Tiempo medido**: p. ej. 8,2 s total → 7,9 s en API → 7,4 s en DB.
- **Causa probable**: query sin índice por `appointment_date` + N+1 al cargar relaciones.
- **Descartado**: red del cliente, bundle frontend, CPU saturada.
- **Próximo paso** (ya con evidencia): optimizar query, agregar índice, usar `include`/`join` en el ORM, o paginar.

Solo en este punto —con números y no suposiciones— tiene sentido proponer cambios de código, índices o caché.

---

## Resumen

| Paso | Foco                     | Herramientas                                   |
| ---- | ------------------------ | ---------------------------------------------- |
| 1    | Contexto y reproducción  | Ticket, entrevista con usuarios                |
| 2    | Tiempo total y waterfall | DevTools Network                               |
| 3    | Separar capas            | curl/Postman vs navegador                      |
| 4    | Backend interno          | Logs, tracing                                  |
| 5    | Base de datos            | EXPLAIN ANALYZE, slow query log, detección N+1 |
| 6    | Infraestructura          | Métricas CPU/RAM/DB, locks, pool               |
| 7    | Conclusión documentada   | Informe para el equipo antes de codear         |
