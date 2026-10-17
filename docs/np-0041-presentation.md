# NP-0041 — Inventario y límites de presentación

## Legacy inspeccionado

- `np0028-web/web/src/app/page.tsx` compone toolbar, KPIs, secciones,
  rankings, scatter, EPP y síntesis desde `loadDashboard`.
- `web/src/app/metricas/page.tsx` carga el mismo dashboard y monta narrativa y
  `MetricsVisualizationDashboard`; `metricas/[slug]/page.tsx` resuelve detalle
  de métrica y el caso especial de EPP observado.
- `DataToolbar` coordina selección multipart, feedback, drag/drop, refresh y
  enlaces de exportación; `SectionComplianceAccordion` contiene expansión,
  selección rápida y navegación; `MetricQuickPanel` implementa diálogo, foco,
  Escape y cierre.
- `domain/dashboard.ts` es el contrato de props; `domain/rules.ts` y
  `domain/narrative.ts` contienen formato/reglas usadas por la UI. No se
  trasladan cálculos oficiales al JSX.
- Tests legacy caracterizados: `DataToolbar`, `MetricQuickPanel`,
  `MetricsVisualizationDashboard`, `SectionComplianceAccordion` y páginas.

## Destino actual

`elecnor-next` usa Pages Router, un `DashboardScreen` sintético y CSS propio;
no tiene `/metricas`, views por flujo ni Zustand instalado. La primera entrega
usa sólo snapshots sintéticos y contratos de props dedicados. No se modifica
legacy ni se conecta HTTP/DB.

## Riesgos y decisiones pendientes

- El baseline visual/fonts del App Router legacy no es una autorización para
  copiar Tailwind, fuentes remotas ni rediseñar la pantalla.
- El estado de selección debe aislarse por instancia/request y descartar
  respuestas viejas; un store Zustand real requiere decisión y dependencia.
- La accesibilidad observada incluye target táctil, teclado, Escape, foco y
  `prefers-reduced-motion`; se prueba con DOM sintético antes de capturas.
- `REVIEW-01`, baseline visual reproducible y aprobación de dependencia siguen
  pendientes; no se declara equivalencia visual productiva.
