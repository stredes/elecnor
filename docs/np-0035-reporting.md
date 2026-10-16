# NP-0035 — Secciones, detalle y narrativa de reporting

## Estado y alcance

La implementación proyecta a `src/backend` las políticas observadas para
aprobación por sección, métricas, detalle de observaciones y síntesis narrativa.
Sólo usa `ReportingFacts` y `MemoryReportingFactsReader` con fixtures sintéticas.
No activa SQLite, PostgreSQL, FastAPI, datos reales ni un endpoint nuevo.

## Evidencia legacy

Se revisaron `section_inspections.py`, `api.py` (`/sections`, `/metrics` y
`/metrics/<code>`), `web/src/domain/narrative.ts`, `metricSnapshot.ts` y los
mappers de inspecciones. Las rutas legacy quedan como evidencia; no son una
dependencia de ejecución de esta rama.

## Políticas preservadas

- Secciones granulares agrupan por sección, métrica y código; `applicable <= 0`
  queda fuera del listado granular.
- Aprobaciones agrupan por sección e inspección, usan `100 * conforming >= 70 *
  applicable`, y separan evaluadas, debajo del umbral y no evaluadas.
- Métricas cuentan observaciones incluyendo estados `NA`/desconocidos, pero el
  ranking sólo incluye grupos con suma de aplicables mayor que cero.
- Weak/strong mantienen desempate por `applicable` y orden estable de entrada.
- La narrativa conserva bandas bajas, riesgo scatter, EPP, sección más débil y
  toma el mínimo desde `weak` y el máximo desde `strong`.
- El snapshot conserva el complemento Python de sección y el complemento
  `100 - compliance` con dos decimales para estadísticas.

## Límites y composición

Los límites están nombrados en `reporting-limits.ts`: dashboard top-10,
consulta de métricas top-12 y registros de detalle top-200. El caso de uso
`GetReportingDetails` lee una vez por proyección y se compone sólo mediante
`ReadInspectionFacts`. El endpoint `pages/api/dashboard.ts` permanece con su
contrato sintético anterior y no consume este caso de uso.

## Verificación y deudas

- Typecheck, lint, quality gates y pruebas dirigidas pasan.
- La suite de integración pasa con el consumidor arquitectónico NP-0035.
- `TEST-01` conserva el bloqueo histórico `TEST_CHANGED_AFTER_REFACTOR`; no se
  reescribió su digest ni se fabricó rebaseline.
- Brain bloquea abrir `TEST-02`/`TEST-03` por `SOURCE_CHANGED_AFTER_REFACTOR`.
  Las pruebas nuevas se ejecutaron manualmente y su resultado queda separado de
  la evidencia TDD gestionada.
- `REVIEW-01` debe revisar el golden aprobado, la paridad de redondeos y el
  cambio de síntesis weak/strong. `D-06` sigue abierto: no se declara corrección
  semántica ni aceptación humana.

## Rollback y activación futura

El rollback consiste en no componer `createReportingDetails` desde rutas o
presentación y conservar el reader sintético existente. La activación requiere
primero golden aprobado, revisión humana y un adaptador de lectura autorizado.
