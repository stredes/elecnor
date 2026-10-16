# NP-0035 — Secciones, detalle y narrativa de reporting

## Inventario de migración

- **Bounded contexts:** reporting de inspecciones y detalle de métricas.
- **Legacy:** `modul_excel_web/app/domain/section_inspections.py`; `app/api.py` GET
  `/sections`, `/metrics`, `/metrics/<code>` y `_section_granular`; frontend
  `web/src/domain/narrative.ts`, `metricSnapshot.ts`, `metricDetail.ts`, mapper
  `infrastructure/mappers/inspections.ts` y componentes de secciones/detalle.
- **Contratos:** sección/agregado y por ítem; aprobación por inspección/sección;
  ranking débil/fuerte/scatter; detalle con observaciones, técnicos y records; narrativa EPP,
  brecha de sección, riesgo scatter y low bands. Universos no se unifican.
- **Dependencias:** Flask/SQLite en legacy; presentación Next/React en legacy. En este checkout,
  políticas TypeScript puras y `ReadReportingDetails`; no DB, HTTP ni dependencia nueva.
- **Tests legacy identificados:** `tests/test_section_inspections.py`, `web/tests/domain/narrative.test.ts`,
  `metricSnapshot.test.ts`, tests de `api.py` y mapper. Se inspeccionaron como evidencia; no son
  una ejecución golden reproducible de NP-0035.
- **Riesgos:** límite/orden de top 10/12, redondeo SQLite/Python/JS, universo de técnicos,
  ausencias y nulos, empate conservando orden de entrada, límite 200, sección sin nombre.

## Proyección y límites

El backend agrega políticas sin activar `pages/api/dashboard.ts` ni cambiar fórmulas por criterio
técnico. `ReportingInsights` acepta el resultado del caso de uso y no recalcula métricas. El reader
disponible es sintético de memoria para tests; no se monta en la página ni representa datos reales.
No existe en el checkout un reader persistente autorizado ni evidencia golden legacy firmada.

Se preservan aprobación exacta al 70%, una observación por fila de métrica, `compliance: null`
cuando no hay universo aplicable, detalle de técnicos y máximo de 200 registros observados. Los
records dependen de fecha/orden de entrada hasta que el puerto entregue el orden estable legacy.
Las métricas M-20..23 necesitan conectar el resumen M-01..07 completo; esta composición mantiene
por ahora sus defaults (sin banda/global input) y no debe usarse como resumen productivo.

## Estado / rollback

Implementación técnica parcial; golden formal, review ligada a commit y reader real permanecen
pendientes. No habilitar tráfico ni promover a `Development` hasta cerrar esos gates. Rollback:
retirar el consumer `ReportingInsights` y mantener las lecturas actuales; no hay migración de datos.
