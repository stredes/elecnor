# Estado de migración V1–V10

Fecha de verificación: 2026-10-20. Alcance: `elecnor-next` y `np0028-fasapi`.
No se ejecutaron importaciones ni sincronizaciones de datos.

## Resultado ejecutivo

La conexión de endpoints queda **completa para el flujo activo del BFF**, pero
la migración sigue **NO-GO productiva** hasta configurar infraestructura y
autorización. Next tiene contratos, adaptadores HTTP, BFF Pages Router,
validación de respuestas, timeout, errores estables y selección explícita de
memoria. FastAPI publica los read models, estado/reintento de sync Drive,
descargas y atestación de `scope`; no se importaron datos reales.

| Gate | Estado | Evidencia / bloqueo |
| --- | --- | --- |
| V1 Inventario | PASS | Legacy, Fasapi, read models y rutas actuales revisados. |
| V2 Pages/BFF | PASS | `pages/` y `pages/api/`; no existe `src/app/`. |
| V3 Configuración | PASS | `FASTAPI_API_URL`/`BACKEND_API_URL`, rutas, timeout y header versionado. |
| V4 C-EXTRACT | PASS | Parser estricto, respuesta Fasapi española, SHA-256, fechas parciales y escala explícita. |
| V5 C-IMPORT | PASS técnico | Multipart, token interno, contrato y BFF conectados; no se ejecutó una importación. |
| V6 Dashboard/inspecciones/procedimientos | PASS técnico | Read models, descargas por inspección/documento, paths y BFF conectados. |
| V7 Métricas/unknowns/hallazgos/logs/analytics | PASS técnico | Rutas upstream, parsers, scope y BFF conectados. |
| V8 Integridad | PASS | `PARCIAL`, nulls, provenance, legacy ID, geografía y no persistencia PDF. |
| V9 Verificación | PASS | Tests, lint, typecheck, quality y build en verde; E2E sintético explícito. |
| V10 Producción | NO-GO | Faltan configuración real, auth aprobada, observabilidad y E2E autorizado contra infraestructura real. |

## Archivos principales entregados

- Configuración: `.env.example`, `backend-config*.ts`, `backend-paths*.ts`.
- Transporte: `http-json*.ts`, `http-errors*.ts`, `backend-error-response*.ts`.
- Documentos: contratos C-EXTRACT, parser/validador y mappers Fasapi.
- Importación: `pages/api/import.ts`, `import-form.ts`, `http-import-gateway.ts` y
  `import-summary.ts`.
- Read models: `pages/api/{metrics,unknowns,findings,logs,analytics,inspections,procedures}`
  y sus parsers/adaptadores en `src/backend`.
- Regresiones: contratos de configuración, procedimientos, multipart, C-EXTRACT,
  C-IMPORT, read models y provenance.
- Drive/proxy: `docs/np-drive-proxy-contract.md`, rutas de sync/estado/
  descarga y adaptadores de stream server-side.
- Guard etapa 2 (NP-0026): `src/backend/domain/guard/*`,
  `src/backend/application/guard/*`, `composition/inspection-guard.ts` y el
  bloque `guard` en `pages/api/inspections/index.ts`.
- Regresiones del guard: matriz de reglas P0, idempotencia, unicidad por
  técnico/día local, contrato de hechos ambiguos y gating del read model.

## Gaps y decisiones pendientes

1. Mantener el contrato de exportación Excel como pendiente explícito: existe
   una ruta configurable en Next, pero no hay endpoint ni consumidor activo.
2. Mantener la ruta de técnicos derivada del listado de inspecciones; no crear
   un endpoint adicional sin contrato de respuesta y consumidor BFF.
3. Resolver autenticación, autorización, allowlist, observabilidad y rollback
   antes de activar el upstream.
4. Ejecutar E2E con FastAPI y PostgreSQL reales, incluyendo payloads anonimizados
   autorizados y comprobación de provenance/SHA.
5. No ejecutar importaciones ni sincronizaciones en esta fase. El endpoint
   `/api/v1/import` queda conectado y probado sólo por contrato.
6. Coordinar con la etapa 1 quién marca `import_status`,
   `validation_status` y `status` que exige `scope=official`: hoy nadie lo hace,
   el scope devuelve 0 filas y el portal queda vacío. La aptitud oficial no
   puede depender de columnas que sólo la etapa 2 podría decidir.
7. Ampliar el guard más allá de la página devuelta: hoy `kpi` y `trays` son de
   ámbito `page` porque no existe agregado upstream.
8. `hc context`/`hc verify` no pueden ejecutarse: falta `.hc/project.json` en el
   checkout. No se restauró `.hc` por la restricción explícita de esta migración.

## Variables de activación

Producción requiere `FASTAPI_API_URL` o `BACKEND_API_URL`. `BACKEND_API_MODE=memory`
y `BACKEND_USE_SYNTHETIC_DATA=true` no habilitan memoria con `NODE_ENV=production`.
La memoria sólo se activa explícitamente fuera de producción; Playwright lo hace
en su `webServer.env`.
