# NP-0028 — Cierre administrativo C-IMPORT

- Fecha: 2026-10-15
- Estado: **BLOCKED EXTERNAL / NO-GO**
- Tipo: cierre administrativo local; no es DONE ni READY.

## Decisión Brain

Brain 5.0.1 no ofrece comando de cierre administrativo, archivo NO-GO ni
transición de historia bloqueada. Se conserva el estado canónico y se registra
este documento como acta final local. `story validate --done` no se utiliza para
forzar un cierre; su resultado es story no Ready.

## Alcance técnico entregado

- Validación pura de selección: 20 PDFs, 15 MiB y extensión `.pdf`.
- Parser multipart `files`, parser estricto de siete contadores y errores 400/502/503.
- Caso de uso `ImportFiles`, puerto `ImportGateway` y adaptador outbound deshabilitado.
- BFF Pages Router `POST /api/import` con 503 controlado, sin forwarding ni SQLite.
- No se habilitó extracción, deduplicación productiva ni persistencia documental.
- Contrato puro `c-import.document.v1`, mappers sintéticos Flask/Fasapi y puertos
  de extractor/escritor, sin wiring ni driver de base de datos.

## Evidencia y validación

- TEST-01/02/04/05/06/07/08: DONE.
- TEST-03: RED histórico conservado; `CYCLE_RESTARTED` oficial; sin GREEN/REFACTOR.
- Unitarias: 30/31; integración: 25/26; el único fallo es TEST-03 esperado.
- Contrato normalizado sintético: 2/2 PASS.
- E2E HTTP: 3/3 PASS; ESLint, TypeScript y build: PASS.
- `hc validate`, `hc doctor`, `hc story validate` y `hc gates`: PASS.
- `hc verify`: BLOCKED — `TEST-03 has no RED/GREEN evidence`; Brain también marca
  source/tests changed after final evidence para el ciclo nuevo no registrado.
- DoR: `ready=false`; `story validate --done`: story no Ready.
- No existe review humana aceptada ni aprobación CTIO formal registrada.

## Baseline documental preparado sin activación

- Se revisaron en modo lectura los contratos Flask/Mitti (`inspections`/`metrics`),
  Fasapi/Mitti y 159 PDFs legacy; no se copiaron bytes ni datos al proyecto.
- La muestra tiene 29 rúbricas, 9 nombres `audit-id`, 98 nombres con fecha y 23 variantes;
  los documentos observados tienen entre 5 y 24 páginas y marcadores comunes.
- El modelo conserva generales, ubicación, puntuación, secciones, ítems, hallazgos,
  observaciones y advertencias; los nulls distinguen ausencia de dato de inferencia.
- La escala de porcentaje queda explícita (`fraction` Flask, `percent` Fasapi); no se recalcula.
- Flask conserva hash, estado, rúbrica, campos originales/normalizados y estados métricos.
- Fasapi conserva título, fecha parcial, zona horaria, páginas, respuestas y hallazgos.
- Se excluyen `stored_path`, `pdf_url`, `json_path` y bytes PDF: no son persistencia objetivo.

### Propuesta PostgreSQL no migrada

- `audit_documents`: versión, formato, nombre, hash, estado de importación y fecha.
- `audits`: datos generales, personas, ubicación, puntuación y contadores observados.
- `audit_sections` y `audit_items`: orden, nombres raw/normalizados, respuesta, estado,
  código, observación, página y flags métricos cuando existan.
- `audit_findings`, `audit_observations` y `audit_warnings`: listas Fasapi/legacy separadas.
- No se guarda contenido ni ruta PDF; tablas y restricciones requieren aprobación D-02/D-05.

### Mapeo y límites

- `flask-document-mapper.ts` agrupa métricas por sección sin recalcular indicadores.
- `fasapi-document-mapper.ts` adapta el esquema estricto y conserva evidencia de página.
- `DocumentExtractor` recibe PDF transitorio y `NormalizedDocumentWriter` solo expone `append`.
- Falta aprobar el adaptador FastAPI real, el repositorio PostgreSQL, auth/allowlist y rollout.

## Decisiones y riesgos externos

- D-02: runtime, capacidad, volumen, writer único y rollback.
- D-03: identidad, contexto autorizado y permisos.
- D-05: schema documental, mapping y fixtures aprobadas.
- D-06: semántica funcional de métricas.
- D-10: allowlist, CSP y medios externos.

D-02, D-03 y D-05 bloquean la activación funcional de C-IMPORT. D-06 y D-10
mantienen bloqueado el DoR global. No se inventaron owners ni aprobaciones.

## Reapertura

1. Obtener owners y aprobación formal de D-02, D-03 y D-05.
2. Resolver D-06 y D-10 para el DoR global.
3. Regularizar TEST-03 mediante review humana o reemplazo técnico autorizado.
4. Completar integración documental, ejecutar `hc verify` PASS y aceptar el release.

## Trazabilidad e integridad

Commits: `e0fc45d`, `b040726`, `eb75279`, `70e0e38`, `c5c7f33`, `57a0766`,
`c0fb61c`, `2f34e59` y `5ba22eb`. Legacy, `main` y `Development` permanecen intactos;
no hubo push, merge ni despliegue.
