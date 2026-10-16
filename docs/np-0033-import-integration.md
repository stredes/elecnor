# NP-0033 — Coordinación de importación documental

## Estado y alcance

Esta entrega es un slice reversible de contratos y aplicación. Coordina hechos
extraídos, interpretación NP-0032 y un `RepositoryPort` mediante puertos tipados,
pero no activa FastAPI, SQLite, PostgreSQL, storage, PDFs reales ni escrituras.
El gateway público sigue usando `DisabledImportGateway` por defecto.

La activación vertical queda condicionada por D-02 (capacidad síncrona o diseño
durable), D-03, D-05, D-08 y la revisión formal `REVIEW-01`. No se presentan como
aprobadas ni se crea un fallback HTTP silencioso.

## Inventario legacy revisado

- `np0028-web/web/src/app/api/import/route.ts`: validación, multipart, llamada
  upstream y mapeo de respuestas; se conserva como evidencia, no se copia.
- `np0028-web/web/src/presentation/components/DataToolbar.tsx`: selección,
  feedback y refresh; no se conecta a un writer nuevo en esta NP.
- `np0028-web/app/services/importer.py`: límites, extracción, interpretación,
  deduplicación, transacción SQLite, temporales y logs; sólo se proyectan sus
  contratos y riesgos, no su deuda estructural.
- Pruebas legacy de importer y API: caracterizan límites de selección, PDF,
  duplicado y resumen; no autorizan datos reales ni una migración automática.

## Proyección implementada

- `DocumentProcessor` representa extracción sin conocer Next ni el request.
- `ImportInterpreter` expone la interpretación pura de NP-0032.
- `ImportRepository` representa persistencia transaccional por documento.
- `ImportInspection` valida contexto y selección, comprueba cancelación, cuenta
  creados, duplicados y errores, y conserva un resumen parcial explícito.
- `createImportInspection` compone esos puertos sin convertirse en runtime activo.
- `pages/api/import.ts` continúa siendo el único límite HTTP y delega al gateway
  deshabilitado; no hay acceso browser→FastAPI ni browser→base de datos.

## Evidencia y rollback

`TEST-01`, `TEST-02` y `TEST-03` tienen RED/GREEN/REFACTOR; `TEST-03` también
tiene rebaseline por separar su contrato de composición. Los dobles son sintéticos
y no contienen cuerpos PDF, secretos ni datos personales. El rollback consiste en
retirar la composición nueva y sus puertos; no requiere migración ni cambios legacy.

La suite existente mantiene sus pruebas unitarias, de integración y E2E. `hc gates`
debe permanecer PASS. `hc verify` continúa condicionado únicamente por la deuda
formal `NFR-01 → REVIEW-01`; no se fabrica una aprobación para cerrarla.
