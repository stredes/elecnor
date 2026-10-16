# NP-0030 — Listado de inspecciones

## Alcance y estado

Esta vertical migra la lectura del listado a Pages Router, un BFF de Next y un
puerto de lectura. El comportamiento se prueba con tres inspecciones sintéticas;
no se leen PDFs, bases reales ni secretos, y no se declara activación productiva.

## Evidencia legacy inspeccionada

| Contexto | Evidencia | Comportamiento conservado |
| --- | --- | --- |
| Inspections/API | `modulo-data-excel/app/api.py:103-152,440-503` | filtros, opciones globales, total sin `LIMIT`, paginación, diez órdenes y nulls al final |
| Persistencia | `modulo-data-excel/app/db.py`, `app/schema.sql:3-59` | `inspections` como dueño de lectura, escala persistida 0..1 y `import_status` |
| Presentación | `modulo-data-excel/web/src/app/inspecciones/page.tsx`, `domain/inspectionFilters.ts` | 25 filas, página 1..10000, filtros URL, bandas de puntaje y opciones |
| Gateway legacy | `modulo-data-excel/web/src/infrastructure/gateways/httpInspectionGateway.ts` | consulta HTTP con query serializada; el navegador no accede a DB |
| FastAPI | `Fasapi/src/app/api/routes/extractions.py` | lectura documental por lotes, pero no es el contrato de listado de inspecciones |

## Contrato proyectado

- Entrada: `q`, `status`, `from`, `to`, `date`, `technician`, `auditor`,
  `score`, `month`, `region`, `sort`, `limit` y `offset`.
- `limit` usa default 500 y clamp 1..1000; `offset` usa default 0 y clamp
  0..1.000.000. La UI fija 25 filas y página 1..10.000.
- Salida exacta: `data`, `total`, `limit`, `offset`, `dates`, `auditors` y
  `regions`. El parser del Gateway rechaza tipos, estados y campos extra.
- La composición usa `MemoryInspectionReader` sin URL o `HttpInspectionReader`
  cuando existe `BACKEND_API_URL`; este último llama `/api/inspections`.

## Límites y riesgos

- `pages/` sólo coordina SSR/presentación; `src/backend/domain`, application y
  ports no importan Next, React, SQL, SQLite ni adaptadores outbound.
- El BFF es la única entrada HTTP del navegador. El adaptador real está preparado,
  pero no se ejecutó contra una base o servicio productivo en esta HU.
- La ruta FastAPI definitiva del read model y la elección de driver/persistencia
  requieren la integración autorizada posterior; no se inventa un endpoint ni se
  modifica `Fasapi` o `modulo-data-excel`.
- Rollback de lectura: quitar `BACKEND_API_URL` devuelve el fixture sintético;
  el cambio no escribe ni modifica ninguna base.

## Evidencia ejecutable

- `tests/integration/inspection-list-parity.test.ts`: filas, total, opciones y
  paginación del puerto.
- `tests/integration/inspection-list-boundaries.test.ts`: clamps, invalidación,
  nulls y query maliciosa tratada como dato.
- `tests/integration/inspection-architecture.test.ts`: URL del Gateway y pureza
  de capas.
- `tests/e2e/inspection-list.spec.ts`: BFF y Pages con Chromium y fixtures.
- Los ciclos RED → GREEN → REFACTOR están registrados en
  `.hc/evidence/NP-0030.json`.
