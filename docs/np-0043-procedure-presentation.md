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

`elecnor-next` compone ahora un catálogo y detalle mediante read models y
fixtures sintéticos en `src/backend/composition`, con Pages Router delegando en
Views. El catálogo entrega familias ya agrupadas; el detalle entrega la
referencia de PDF y el estado de video pendiente/no disponible, pero la vista
indica que el PDF no está disponible en el entorno sintético y no ofrece un enlace
sin recurso. El formulario explica que el alta no está disponible y deshabilita
Guardar cuando no recibe un handler. El store de alta conserva el draft y resuelve
sólo la solicitud vigente. No se activan FastAPI, POST, Blob, PDF real,
persistencia ni llamadas a YouTube.

## Riesgos y decisiones pendientes

- D-10 debe fijar allowlist/CSP y alcance de medios externos antes de reproducir
  video o miniaturas; la vista sólo podrá mostrar un estado opcional vacío.
- El PDF es una referencia/estado sintético hasta que exista contrato Next y
  storage aprobado; actualmente no se presenta una URL no servida como enlace.
- El draft de alta no se borra por errores; el formulario permanece deshabilitado
  cuando no hay handler, y no simula una respuesta ni persistencia.
- `NP-0043/REVIEW-01` queda abierta para el CTO sobre D-10, same-origin y
  aislamiento. No se registra aprobación ni attestation.
