# NP-0028 — Cierre técnico C-IMPORT

- Fecha: 2026-10-15
- Estado: **DONE técnico / NO-GO productivo**
- Tipo: cierre técnico local; no activa C-IMPORT ni autoriza despliegue.

## Decisión Brain

Brain 5.0.1 conserva la evidencia TDD en el manifiesto canónico. TEST-03 fue
reemplazado por el contrato técnico autorizado y completó RED/GREEN/REFACTOR;
la activación productiva queda separada en NP-0033.

## Alcance técnico entregado

- Validación pura de selección: 20 PDFs, 15 MiB y extensión `.pdf`.
- Parser multipart `files`, parser estricto de siete contadores y errores 400/502/503.
- Caso de uso `ImportFiles`, puerto `ImportGateway` y adaptador outbound deshabilitado.
- BFF Pages Router `POST /api/import` con 503 controlado, sin forwarding ni SQLite.
- No se habilitó extracción, deduplicación productiva ni persistencia documental.
- Contrato puro `c-import.document.v1`, mappers sintéticos Flask/Fasapi y puertos
  de extractor/escritor, sin wiring ni driver de base de datos.

## Evidencia y validación

- TEST-01/02/03/04/05/06/07/08: DONE.
- TEST-03: contrato normalizado sintético con RED/GREEN/REFACTOR registrados.
- Unitarias, integración y E2E HTTP: PASS; ESLint, TypeScript y build: PASS.
- Contrato normalizado sintético: 3/3 PASS.
- TEST-08: rebaseline oficial registrado tras el contrato técnico no activante.
- Auditoría de dependencias de producción: `npm audit --omit=dev`: 0 vulnerabilidades.
- `hc validate`, `hc story validate --done`, `hc gates` y `hc verify`: PASS.
- DoR técnico: `ready=true`; no implica GO productivo.

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

D-02, D-03 y D-05 siguen condicionando la activación funcional de C-IMPORT.
D-06 y D-10 permanecen como controles externos; no se inventaron owners ni
aprobaciones.

## Reapertura

1. Abrir NP-0033 con owners y aprobación formal de D-02, D-03 y D-05.
2. Resolver D-06 y D-10 para el alcance productivo.
3. Aprobar schema, auth/allowlist, rollback y persistencia antes de activar.
4. Completar integración documental y aceptar el release en una historia separada.

## Trazabilidad e integridad

La evidencia completa está en `.hc/evidence/NP-0028.json` y en el historial de
Git de `NP-0028`. Legacy, `main` y `Development` permanecen intactos; no hubo
push, merge ni despliegue.
