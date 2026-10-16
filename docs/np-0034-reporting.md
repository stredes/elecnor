# NP-0034 — Reporting equivalente M-01 a M-07

## Estado y alcance

Esta entrega migra a dominio/aplicación las políticas observadas para KPIs,
percentiles y bandas. Usa hechos sintéticos mediante `ReadInspectionFacts` y no
activa `pages/api/dashboard.ts`, SQLite, PostgreSQL, FastAPI ni datos reales.
El snapshot dashboard existente permanece como fallback sintético hasta disponer
del read port y golden completos.

## Fórmulas preservadas

- M-01 cuenta todos los `importLogs`, incluidos duplicados y errores.
- M-02 cuenta inspecciones y M-02 válido cuenta porcentajes no nulos; no deduplica
  por `logicalKey`.
- M-03 calcula media aritmética de porcentajes válidos, escala a 100 y aplica
  redondeo SQL a dos decimales; el KPI vacío se serializa como `0.00%`.
- M-04 cuenta `< 0.7` y `= 1` sin redondear antes de comparar.
- M-05 cuenta métricas `NO_CONFORME` y suma acciones con `null` como cero.
- M-06 preserva media, mediana estándar, índices `floor(.25*(n-1))` y
  `floor(.75*(n-1))`, con redondeo Python a dos decimales; vacío es `null`.
- M-07 conserva bandas `[0,.5)`, `[.5,.6)`, `[.6,.7)`, `[.7,.8)`,
  `[.8,.9)`, `[.9,1)` y `=1`, en orden fijo y excluyendo `null`.

## Proyección implementada

- `reporting-facts-contract.ts` separa hechos de inspecciones, logs y métricas.
- `calculate-kpis.ts`, `calculate-percentiles.ts` y `count-score-bands.ts`
  contienen las políticas puras.
- `GetDashboardOverview` coordina el `ReadInspectionFacts` port y serializa el
  contrato de overview sin depender de Next ni de un cliente de base de datos.
- `MemoryReportingFactsReader` sólo sirve para fixtures; la composición no se
  conecta al endpoint público existente.

## Evidencia y deuda

`TEST-01`, `TEST-02` y `TEST-03` tienen RED/GREEN/REFACTOR. `TEST-02` cubre
vacíos, nulos, límites, n=1/n=2 y una frontera sub-empate de redondeo SQL.
El golden utilizado es sintético y debe compararse con una fuente aprobada antes
de activar el handler. D-06 y `REVIEW-01` siguen abiertos; no se declara una
corrección semántica ni una aprobación humana.
