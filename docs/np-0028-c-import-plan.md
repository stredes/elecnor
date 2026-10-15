# Candidato inicial de migración: NP-0028 / C-IMPORT

Estado: **diseño técnico preparado; migración funcional no iniciada ni autorizada**.

## Legacy analizado

- Entrada UI: `modulo-data-excel/web/src/presentation/components/DataToolbar.tsx`.
- Regla cliente: `modulo-data-excel/web/src/domain/pdfImport.ts`.
- BFF App Router: `modulo-data-excel/web/src/app/api/import/route.ts`.
- Backend Flask (snapshots): `modulo-data-excel/app/api.py`, `app/services/importer.py`
  y `np0028-web/app/api.py`, `app/services/importer.py`.
- Backend FastAPI: `Fasapi/src/app/api/routes/pdf.py` y `routes/extractions.py`.
- Pruebas: `modulo-data-excel/web/tests/domain/pdfImport.test.ts`,
  `modulo-data-excel/web/tests/presentation/DataToolbar.test.tsx`,
  `modulo-data-excel/tests/test_importer*.py` y
  `Fasapi/tests/characterization/test_np0027_documents.py`.
La responsabilidad del BFF es validar la selección, reenviar multipart y
traducir errores. La persistencia observada pertenece a Flask; Fasapi tiene un
flujo distinto de extracción y registro por lotes.

## Comportamiento confirmado

1. El navegador selecciona o arrastra archivos bajo máximo 20 y 15 MiB por PDF;
   valida extensión `.pdf`, pero no firma binaria. Envía `files` a `/api/import`.
2. El BFF convierte el formulario, llama `BACKEND_API_URL/api/import`, devuelve
   el resumen 200, mapea rechazo upstream a 502 y fallo de conexión a 503.
3. Flask rechaza selección vacía o superior a 20 con 400 y procesa cada archivo:
   extensión, tamaño, magic bytes `%PDF-`, SHA-256 duplicado, extracción de texto,
   parseo, validación de métricas, persistencia y log.
4. El resumen contiene `seleccionados`, `procesados`, `duplicados`, `errores`,
   `inspecciones_nuevas`, `metricas_insertadas` y `metricas_sin_clasificar`.
5. Flask escribe `inspections`, `metrics`, `unknown_metrics` e `import_logs` en
   SQLite; elimina el archivo temporal y revierte la transacción ante error.
6. Fasapi no expone `/api/import`: `POST /api/v1/pdf/extract` recibe un `file`
   singular, límite configurable por defecto 50 MiB y devuelve un documento
   estricto; el registro SQLite pertenece a su flujo de lotes.

## Diferencias no resolubles por inferencia

- No está decidido si C-IMPORT objetivo conserva el resumen Flask o adopta el
  documento Fasapi; sus campos, límites, errores y persistencia no son equivalentes.
- La regla canónica de Fasapi como único writer contradice la escritura actual
  de Flask; requiere owner y decisión D-02/D-05 antes de adaptar.
- No hay autenticación en estas rutas; D-03 sigue pendiente y no se inventan roles.
- La extracción Excel es otra ruta (`/export/excel`), no parte confirmada de C-IMPORT.

## Proyección propuesta

| Legacy | Elecnor |
| --- | --- |
| `DataToolbar` + `pdfImport` | presentación + regla pura, sin React en dominio |
| Route Handler App Router | `pages/api/import.ts` como BFF |
| Resumen/errores aprobados | tipos, mapper y contrato en `src/backend/` |
| Persistencia Flask/Fasapi | adaptador externo detrás de un puerto |
| upstream sintético | fixture/adaptador de test, nunca datos reales |

## Contrato recomendado para aprobación

- Compatibilidad funcional: conservar el resumen observado de `POST /import`.
- Entrada: `multipart/form-data`, campo repetido `files`, máximo 20 PDFs y 15 MiB.
- Salida 200: los siete contadores observados; error público como `{error}`.
- BFF: exponer `/api/import`, validar transporte y traducir 400/502/503.
- Dominio: modelo interno de selección y resultado; no conoce HTTP, SQLite ni FastAPI.
- FastAPI: procesa, normaliza, deduplica y escribe solo mediante el servicio aprobado.
- Persistencia, transacción y contrato documental quedan condicionados a D-02/D-05.

La matriz de aprobación está en `docs/np-0028-decision-matrix.md`; la ficha de
TEST-01 documenta su ciclo real y la evidencia se conserva en `.hc/evidence/`.

## TEST-02 — slice ejecutado

- `src/backend/adapters/inbound/import-summary.ts` valida los siete contadores,
  enteros no negativos y conjunto exacto de campos mediante `ImportContractError`.
- `tests/contracts/import-summary.test.ts` cubre payload válido, ausentes, tipos,
  negativos, fracciones y campos extra con fixtures sintéticas.
- No implementa forwarding HTTP, extracción, duplicados ni persistencia; D-02/D-05
  continúan delimitando esos aspectos.

## Secuencia autorizable

1. Reproducir RED con el contrato observado y fixture sintética.
2. Definir puerto, mapper y errores sin copiar implementaciones legacy.
3. Implementar GREEN mínimo para 200/502.
4. Ejecutar regresión, E2E HTTP real y REFACTOR.
5. Registrar evidencia Brain y revisión de compatibilidad.

## Límites posteriores al cierre

NP-0028 cierra el contrato técnico y conserva la activación funcional fuera de
alcance. El diseño puro no se cablea a rutas, extracción ni persistencia; no se
altera legacy ni se inicia migración funcional en Elecnor.
## Propuesta de ampliación (no creada)
- Historia sugerida: `NP-0033-C-IMPORT-ACTIVATE`, separada de NP-0028.
- Incluye extractor FastAPI por formato, PostgreSQL por puerto y BFF con forwarding.
- AC: schema/fixtures aprobados, idempotencia y cero PDF persistido.
- AC: backend aplica importación pública y rechaza modificar/eliminar registros.
- AC: métricas se entregan sin fórmulas nuevas y Railway queda probado/seguro.
- Fuera: cambiar legacy, fórmulas no aprobadas, despliegue sin autorización.
- CTO debe aprobar owners, schema, auth/allowlist, evidencia y rollback antes de abrirla.
