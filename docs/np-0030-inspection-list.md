# NP-0030 — Listado de inspecciones

## Alcance y estado

Esta vertical migra la lectura del listado a Pages Router, un BFF de Next y un
puerto de lectura. El comportamiento se prueba con tres inspecciones sintéticas;
no se leen PDFs, bases reales ni secretos, y no se declara activación productiva.

## Decisiones propuestas recibidas

Estas definiciones son una base técnica de trabajo, no una aprobación de
Arquitectura, QA, Seguridad ni del propietario de datos.

- **REVIEW-01:** revisión humana de arquitectura, contratos, pruebas y evidencia,
  con revisor, fecha, commit, resultado y attestation `HC-Review`.
- **D-05:** `C-EXTRACT v1.0.0`, schema JSON versionado y estricto; preservar nulls,
  fechas parciales, orden explícito, ubicación separada y rúbrica sin inventar
  datos. Las fixtures deben cubrir válidos, incompletos, variantes y errores.
- **D-11:** PDFs reales anonimizados autorizados, fuentes versionadas y baseline
  visual reproducible. La propuesta no autoriza todavía su incorporación.
- **Producción:** Next como portal/BFF, FastAPI como procesador y único escritor,
  PostgreSQL como persistencia; límites, permisos, retención, integración externa,
  legacy, métricas y recursos externos siguen requiriendo sus decisiones D-02,
  D-03, D-04, D-06, D-08, D-09 y D-10.

El checklist de desbloqueo exige seis evidencias: revisión arquitectónica,
attestation vinculada al commit, contrato C-EXTRACT versionado, mapping y fixtures
aprobados, autorización de PDFs y baseline visual reproducible. Marcar esta lista
en documentación no sustituye ninguna aprobación formal.

## Resolución técnica de bloqueos

La arquitectura queda definida como portal Next.js, Gateway, FastAPI como único
escritor de negocio y PostgreSQL como persistencia estructurada. El frontend no
escribe directamente en la base, los PDFs no se conservan permanentemente y los
contratos entre componentes son versionados y verificables.

`C-EXTRACT v1.0.0` queda propuesto con SemVer, campos obligatorios
`contract_version`, `document_type`, `extraction_status` y `sections`, nulls
explícitos, fechas parciales separadas, orden documental, geografía trazable y
mapping documentado hacia persistencia. No se permite persistencia parcial sin
regla explícita.

La evidencia D-11 debe usar PDFs anonimizados y autorizados, fuentes licenciadas
versionadas y baseline visual reproducible con entorno y herramientas registrados.

**Estado:** NP-0030 permanece BLOQUEADA. Faltan attestation humana `REVIEW-01`,
aprobación formal de D-05 y autorización formal de D-11. D-02, D-03, D-04, D-06,
D-08, D-09 y D-10 siguen condicionando producción o importación real.

## Evidencia automatizada para REVIEW-01

Revisión técnica ejecutada sobre el commit de implementación `9fc976d` y la
evidencia TDD `841a0be`. Se revisaron el contrato candidato y su validador
(`src/backend/domain/c-extract-*.ts`), la composición y Gateway de inspecciones,
`pages/api/inspections/index.ts`, `pages/api/import.ts`, el Gateway de importación
deshabilitado, los tests sintéticos de contratos y los scanners de calidad.

Resultados observados: `hc gates` PASS; unitarias 44/44; integración 39/39; E2E
4/4 durante el rebaseline; build, lint, typecheck, líneas, límites, contratos y
audit PASS. El validador rechaza versiones incompatibles, campos de persistencia,
índices desordenados, coordenadas sin fuente y rúbricas sin trazabilidad.

Controles de seguridad observados: la lista acepta sólo GET y responde 405 a otros
métodos; el navegador no accede a DB; C-IMPORT mantiene el Gateway upstream
deshabilitado; no hay SQL, SQLite, PDF original ni secreto en el nuevo código.

Riesgos pendientes: la attestation `HC-Review` no existe; C-EXTRACT sigue siendo
candidato D-05; no hay PDFs reales autorizados ni baseline D-11; no se probó un
FastAPI/PostgreSQL productivo. `hc verify` pasa la evidencia técnica y falla sólo
por `NFR-01 references unresolved REVIEW-01`.

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
