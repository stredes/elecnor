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

El slice actual sólo contiene snapshot, puerto y doble de memoria. No activa
HTTP, FastAPI, openpyxl, SQLite, datos reales ni la ruta de exportación.
