# Inventario inicial: legacy → Elecnor

Este mapa describe fuentes observadas del workspace. No convierte legacy en una
dependencia ni autoriza migrar datos o comportamiento no especificado.

| Fuente legacy | Parte identificada | Proyección en Elecnor |
| --- | --- | --- |
| `modulo-data-excel/web` | Dashboard Next y páginas históricas | `pages/` + `src/dashboard/` |
| `modulo-data-excel/web/src/app/api` | API/BFF del baseline | `pages/api/` + mappers |
| `modulo-data-excel/app` | Flask, servicios y acceso a datos | `src/backend/` + puerto explícito |
| `Fasapi/src/app` | FastAPI, rutas y adaptadores de backend | Adaptador outbound, no import directo |
| `np0028-web/web` | Slice NP-0028 y contratos Brain | Evidencia y contratos, no copia automática |
| `np0028-fasapi` | Worktree FastAPI de NP-0028 | Fuente de contratos aprobados únicamente |
| `np0028-fasapi/src/app/api/routes/pdf.py` | Upload, extracción por ID y `extract-and-send` | `src/backend/adapters/outbound/http-c-extract-reader.ts`; sin activar sender |
| `np0028-fasapi/src/app/services/{extraction_service,pdf_validator,pdf_extractor}.py` | Composición concreta, límites y recursos PyMuPDF | `src/backend/application/extract-document.ts` + puerto C-EXTRACT; parser Python permanece legacy |
| `np0028-fasapi/src/app/domain/evaluacion.py` | Preguntas, secciones y resumen de hechos | C-EXTRACT candidato; orden y campos ampliados requieren D-05 |
| `modulo-data-excel/app/domain/normalization.py` | NFKD, acentos, estados y flags | `src/backend/domain/import-normalization.ts` |
| `modulo-data-excel/app/domain/metrics_equivalence.py` | 49 métricas, keywords y limpieza de texto | `src/backend/domain/catalog/` y `catalog-match.ts` |
| `modulo-data-excel/app/services/catalog.py` | exacto, contenido y SequenceMatcher ≥0.88 | `src/backend/domain/catalog/catalog-match.ts` |
| `modulo-data-excel/app/domain/geography.py` | ciudades, aliases, regiones y coordenadas | `src/backend/domain/geography/`; sin fuentes nuevas |
| `modulo-data-excel/app/services/importer.py:123-200` | validación, rúbrica, clave y completitud | `src/backend/domain/import-rubric.ts`, `logical-key.ts`, `determine-import-status.ts` |
| `modulo-data-excel/app/services/importer.py` | extracción, deduplicación, transacción SQLite, temporales y logs | contratos `DocumentProcessor`/`ImportRepository`; activación bloqueada por D-02/D-03/D-08 |
| `np0028-web/web/src/app/api/import/route.ts` | multipart, llamada upstream y mapeo de respuestas | `pages/api/import.ts` como único BFF; upstream no activo |
| `np0028-web/web/src/presentation/components/DataToolbar.tsx` | selección, feedback y refresh | evidencia UI; no conecta un writer nuevo en NP-0033 |
| `np0028-web/app/domain/report_queries.py` | KPI aggregate, logs, hallazgos y bandas M-01..M-05/M-07 | `src/backend/domain/reporting/calculate-kpis.ts`, `count-score-bands.ts` con fórmulas preservadas |
| `np0028-web/app/api.py:506-540` | media, mediana, p25, p75 y snapshot panorama | `calculate-percentiles.ts`, `GetDashboardOverview`; handler público aún no se activa |
| `np0028-web/web/src/domain/dashboard.ts` + `infrastructure/mappers/dashboard.ts` | contrato de KPI/panorama/distribución y adaptación a camelCase | `reporting-overview-contract.ts`; golden sintético antes de reemplazar mapper |
| `np0028-web/app/domain/section_inspections.py`, `app/api.py:293-374,614-721`, `web/src/domain/{narrative,metricSnapshot}.ts` y mappers de inspección | NP-0035: secciones, detalle de métricas, snapshot y narrativa; rutas `/sections`, `/metrics` y `/metrics/<code>` | `src/backend/domain/reporting/`, `src/backend/application/reporting/` y composición inyectable; sin activar endpoint ni frontend |
| `np0028-web/app/domain/geography.py`, `app/api.py:543-607,720-766` | NP-0036: ciudades, regiones, geolocalización, evolución, ranking y trazabilidad; no GPS ni backfill | `src/backend/domain/geography/`, read models de analytics y composición sintética; sin tocar legacy ni activar rutas |
| `np0028-web/web/src/app/tecnicos/[nombre]/page.tsx`, `web/src/domain/analytics.ts` | NP-0036: perfil técnico con `limit=500`, semanas ISO, huecos y media móvil4 | contratos y políticas puras de `src/backend/domain/technicians/` y `src/backend/domain/analytics/`; cliente no recalcula |

## Regla por NP

La historia de cada NP debe añadir aquí el alcance concreto: archivos legacy
afectados, rutas, contratos, riesgos, tests y decisiones. La implementación se
proyecta después en la capa destino, con tests de caracterización antes del
refactor y sin transportar deuda estructural por conveniencia.

## Estado inicial

Elecnor contiene únicamente un dashboard sintético, un BFF sintético y un
adaptador de backend opcional. No se ha migrado ninguna tabla, PDF, SQLite,
credencial ni fórmula productiva.
