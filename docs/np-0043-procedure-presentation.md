# NP-0043 — Inventario y límites de procedimientos

## Legacy inspeccionado

- `web/src/app/procedimientos/page.tsx` resuelve `q/area`, carga el catálogo y
  compone búsqueda, contador, `ProcedureFamilyAccordion` y `ProcedureForm`.
- `procedimientos/[id]/page.tsx` carga la ficha, construye el PDF same-origin
  por Next y monta `YoutubeEmbed` sólo cuando existe `youtubeVideoId`.
- `ProcedureFamilyAccordion` agrupa variantes por familia, mantiene una abierta,
  informa áreas/conteo de video y enlaza cada ficha.
- `ProcedureForm` mantiene errores/éxito/pending, exige PDF, envía multipart a
  `/api/procedures` y refresca tras éxito; ese efecto mutable queda fuera de este
  slice sintético.
- `domain/procedure.ts` contiene el contrato, agrupación por código+título,
  orden español y normalización de URL YouTube; no se copia como regla nueva al
  cliente.

## Destino actual

`elecnor-next` no tiene aún contratos, páginas ni composición de procedimientos.
NP-0043 añadirá únicamente read models y fixtures sintéticos, vistas Pages,
estado discriminado de filtro/alta y un formulario presentacional. No activará
FastAPI, POST, Blob, PDF real, persistencia ni llamadas a YouTube.

## Riesgos y decisiones pendientes

- D-10 debe fijar allowlist/CSP y alcance de medios externos antes de reproducir
  video o miniaturas; la vista sólo podrá mostrar un estado opcional vacío.
- El PDF será una referencia/estado sintético hasta que exista contrato Next y
  storage aprobado; ningún componente conocerá endpoint o ruta interna.
- El draft de alta no se borra por errores; éxito sólo se representa mediante
  una respuesta sintética vigente y una vez por request.
- `NP-0043/REVIEW-01` queda abierta para el CTO sobre D-10, same-origin y
  aislamiento. No se registra aprobación ni attestation.
