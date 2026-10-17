# NP-0042 — Inventario y límites de inspecciones

## Legacy inspeccionado

- `web/src/app/inspecciones/page.tsx` parsea filtros/página, carga el listado y
  compone `SearchForm`, tabla responsive, `CardList` y paginación.
- `inspecciones/[id]/page.tsx` carga detalle, muestra KPIs/métricas y monta
  `EditInspectionPanel`, descarga PDF y navegación breadcrumb.
- `tecnicos/[nombre]/page.tsx` decodifica Unicode, solicita hasta 500 registros
  y monta `TecnicoProfileTabs`; el promedio y el bajo-70 son presentación del
  read model, no reglas nuevas del cliente.
- `SearchForm`, `EditInspectionPanel`, `InspectionsPagination`, `CardList` y
  `TecnicoProfileTabs` concentran filtros, draft, foco, errores, paginación y
  tabs. Sus tests de presentación son evidencia legacy, no fixtures productivos.

## Destino actual

`elecnor-next` ya tiene parser/contrato sintético de listado y contratos de
detalle, mutación y perfil, pero sólo una `InspectionListScreen`; no existen
views Pages para detalle/técnico ni stores de filtros. El slice nuevo usa
fixtures sintéticas y no activa clientes HTTP, PUT/DELETE, PDF, permisos ni DB.

## Riesgos

- La URL es la fuente de filtros aplicados; el draft no debe perderse por una
  respuesta vieja o por back/forward.
- Debounce, cancelación, selección inmediata y cleanup deben probarse sin
  compartir estado SSR entre requests.
- El foco debe volver al disparador; Escape y error de mutación no pueden cerrar
  ni navegar como si hubiera éxito.
- D-03 y REVIEW-01 siguen pendientes; no se inventan autorización ni efectos.
