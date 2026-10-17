# NP-0040 — Inventario y contrato técnico de exportación

## Evidencia legacy inspeccionada

- `modulo-data-excel/app/services/excel_report.py:75-88` construye un XLSX
  directamente desde una conexión SQLite y crea `Resumen`, `Distribucion`,
  `Secciones`, `Metricas`, `Trazabilidad` y `Detalle`.
- El mismo builder contiene consultas, reglas de selección, estilos, merges,
  freeze panes, tablas y gráficos openpyxl en 384 líneas.
- `app/domain/report_queries.py` comparte KPI, conteos y bandas entre API y
  Excel; sus aliases y umbrales forman parte del contrato caracterizado.
- `modulo-data-excel/app/api.py:399-408` expone `GET /api/export/excel`, usa
  `send_file` y fija `informe_visual_metricas_inspecciones.xlsx`.
- `np0028-web/web/src/app/api/export/excel/route.ts` llama al backend,
  materializa `arrayBuffer`, traduce errores a 502/503 y añade headers de
  descarga. Es evidencia legacy App Router, no destino Pages Router.

## Hallazgo FastAPI

`Fasapi` y `np0028-fasapi` contienen extracción PDF, lotes y registro SQLite,
pero no contienen ruta ni renderer Excel/openpyxl. C-REPORT debe ser una
capacidad nueva; no se asume que exista un endpoint equivalente.

## Proyección hexagonal

1. Next calcula y entrega un `ReportSnapshot` tipado desde read models ya
   caracterizados; no consulta SQLite ni manipula XLSX.
2. Un puerto `RenderReport` transporta el snapshot a un renderer Python.
3. FastAPI separa contrato, caso de uso y adaptador openpyxl por hoja/estilo.
4. El BFF Pages traducirá stream, filename y errores sólo cuando se autorice.

## C-REPORT candidato: contrato compartido

El payload intercambiable queda limitado, por ahora, a un objeto JSON-compatible
`{ overview, details }`. `overview` conserva las claves tipadas de
`ReportingOverview` (`kpis`, `panorama`, `distribution`) y `details` conserva
`ReportingDetailsResult` (`sections`, `approvals`, `rankings`, `narrative`).
Next es el dueño de esos agregados y FastAPI no los recalcula.

El puerto de renderizado usa la misma semántica en TypeScript y Python:

| Celda | Valor permitido | Semántica |
|---|---|---|
| `text` | string o null | dato literal; nunca fórmula, aunque empiece por `=` |
| `number` | number | valor numérico ya calculado |
| `blank` | null | celda vacía |

El resultado sintético conserva `status: "RENDERED"` y `sheets[]` con `name` y
`cells[]`. El orden legacy observado es `Resumen`, `Distribucion`, `Secciones`,
`Metricas`, `Trazabilidad`, `Detalle`; las columnas, gráficos, estilos y
formatos OOXML quedan como baseline de caracterización, no como autorización
para crear fórmulas ni corregir variantes semánticas.

No existe todavía una versión HTTP aprobada de C-REPORT. No se añaden
`contract_version`, autenticación, límites, retención ni códigos de error hasta
que exista decisión operativa y `REVIEW-01` con alcance explícito.

El slice actual sólo contiene snapshot, puerto y doble de memoria. No activa
HTTP, FastAPI, openpyxl, SQLite, datos reales ni la ruta de exportación.
