# Contrato Drive/read-model: FastAPI → Next

Fecha: 2026-10-19. Alcance: sólo `elecnor-next`; FastAPI y legacy no fueron
modificados.

## Contrato FastAPI revisado

El backend actual usa `X-Fasapi-Contract-Version:
c-legacy-inspections/1.0.0`. Las rutas modernas sensibles además requieren
`X-Fasapi-Internal-Token`, que Next envía sólo server-side desde
`FASTAPI_INTERNAL_TOKEN`/`BACKEND_INTERNAL_TOKEN`.

| BFF Next | FastAPI actual/esperado | Estado |
| --- | --- | --- |
| `POST /api/imports/drive/sync` | `POST /api/v1/sync/drive?limit=N` | Alineado; FastAPI responde 200, también se acepta 202 |
| `GET /api/imports/:id` | `GET /api/v1/sync/drive/:id` esperado | Bloqueado 424 hasta publicar estado PostgreSQL por `sync_id` |
| `POST /api/imports/:id/retry` | `POST /api/v1/sync/drive/:id/retry` esperado | Bloqueado 424 hasta publicar reintento del mismo `sync_id` |
| `GET /api/inspections` | `GET /api/v1/inspections` | Envía `scope` explícito (`official` por defecto); con `official` exige atestación `X-Fasapi-Scope` |
| `GET /api/inspections/:id` | `GET /api/v1/inspections/:id` | Mismo `scope`; normaliza `source` a provenance público y mapea `uniqueness` |
| `GET /api/inspections/:id/download` | `GET /api/v1/inspections/:id/download` | Alineado |
| `GET /api/documents/:id/download` | Ruta esperada | Bloqueado 424 hasta publicar descarga por `document_id` |

## Incompatibilidades exactas pendientes

1. `sync/drive` es síncrono y devuelve `SyncSummary` con `sync_id`; FastAPI no
   publica todavía estado ni reintento persistidos en PostgreSQL para ese ID.
   Next ya no usa `/api/v1/pdf/batch/*` ni su Registry SQLite como evidencia de
   Drive: responde 424 hasta habilitar explícitamente la capacidad.
2. La unicidad de duplicados es lógica de negocio de la etapa 2 y ya no tiene
   bandeja ni decisión manual. FastAPI publica el bloque `uniqueness` por item;
   Next lo valida y lo mapea, pero no deriva `canonical_id` ni fusiona
   documentos.
3. El contrato de scope es explícito y configurable
   (`BACKEND_INSPECTIONS_SCOPE=official|all`). Con `official` (por defecto) Next
   exige `X-Fasapi-Scope: official` en la respuesta y falla cerrado con 424 si
   falta. **Dependencia con la etapa 1:** `scope=official` de FastAPI exige
   `is_official=TRUE AND import_status='IMPORTADO' AND validation_status='VALIDADO'
   AND status='COMPLETA'`; esas columnas no las marca nadie hoy, así que
   `scope=official` devuelve 0 filas y el portal pinta vacío. La aptitud oficial
   no puede depender de columnas que sólo la etapa 2 podría decidir: la etapa 1
   debe definirlas (o exponer un scope intermedio) antes de considerar GO. La
   opción `all` está disponible como opt-in documentado y trazado, pero no se
   cambia por defecto sin esa decisión.
4. FastAPI `/api/v1/import` acepta PDFs, pero no declara campos multipart para
   `sha256`, `legacy_id` ni `provenance`; Next los reenvía server-side y su
   persistencia queda pendiente de alinear el contrato FastAPI.
5. El detalle incluye `source.drive_file_id`, SHA, nombre y provenance. Next
   elimina `drive_file_id` y nunca lo serializa al navegador.
6. El read model de inspecciones no publica todavía todos los hechos que exige
   el guard de negocio (etapa 2). El listado ya expone el bloque `uniqueness`
   (`sha256`, `technician_normalized`, `local_inspection_date`,
   `local_inspection_at`, `completeness`, `metric_count`, `modified_time`,
   `document_kind`, `exact_copy_of`) por item, y Next lo acepta y lo mapea. Si
   el bloque llega ausente o `null`, Next no infiere nada: `technician`,
   `indicator` y `document_kind` caen a los campos base y el guard reporta cada
   ausencia como motivo explícito.

## Guard de negocio (etapa 2, NP-0026)

`src/backend/domain/guard/` evalúa, por inspección, un veredicto
`OK | WARNING | BLOCKED | EXCLUDED` con `reasons[]` (`code`, `severity`,
`field`, `evidence`) más `rule_version` y `computed_at`. Es determinista e
idempotente: mismos hechos y mismo `computed_at` producen el mismo veredicto;
el reloj del servidor no se usa dentro de la regla.

Reglas P0 implementadas con su propio código de motivo:

| Regla | Código | Severidad por defecto |
| --- | --- | --- |
| Técnico ausente tras normalizar | `TECHNICIAN_MISSING` | BLOCKED |
| Fecha ausente / parcial / ambigua | `DATE_MISSING` / `DATE_PARTIAL` / `DATE_AMBIGUOUS` | BLOCKED / WARNING / BLOCKED |
| Hora inválida o zona desconocida | `TIME_INVALID` / `TIMEZONE_UNKNOWN` | WARNING |
| Provenance incompleto o SHA recalculado distinto | `PROVENANCE_INCOMPLETE` / `SHA_MISMATCH` | BLOCKED |
| Copia exacta por SHA (`exact_copy_of` poblado) | `DUPLICATE_EXACT_COPY` | EXCLUDED |
| Mismo técnico + mismo día local con distinto SHA | `DUPLICATE_SAME_TECHNICIAN_DAY` | EXCLUDED (perdedor) |
| `document_kind != INSPECTION` | `DOCUMENT_KIND_NOT_INSPECTION` | EXCLUDED |
| Puntaje > máximo, % fuera de escala, código ausente o repetido | `METRIC_SCORE_OVER_MAX` / `METRIC_PERCENTAGE_OUT_OF_RANGE` / `METRIC_MISSING_CODE` / `METRIC_DUPLICATED` | BLOCKED / WARNING / BLOCKED / WARNING |
| Rúbrica o secciones vacías, sin métricas | `RUBRIC_EMPTY` / `SECTIONS_EMPTY` / `NO_METRICS` | WARNING / WARNING / BLOCKED |
| Estado `PARCIAL` conservado | `PARTIAL_STATUS_PENDING` | INFO (bandeja Pendientes) |

El guard nunca infiere el año, nunca sustituye la hora por UTC ni por la zona
del servidor y nunca fusiona datos de dos documentos. Los umbrales viven en
`GuardPolicy` (`DEFAULT_GUARD_POLICY`) y están versionados.

### Unicidad por técnico y día local

Un técnico inspeccionado no puede tener más de 1 inspección válida por día
local, aunque las horas sean distintas (el auditor no está restringido). El día
local es el del hecho (timezone del documento), nunca UTC ni la zona del
servidor. El alcance queda fijo y versionado como
`uniquenessScope = technician_per_local_day` en `GuardPolicy`; no existe ventana
en minutos.

- `DUPLICATE_EXACT_COPY`: si `exact_copy_of` está poblado (mismo SHA-256) el
  documento queda `EXCLUDED`.
- `DUPLICATE_SAME_TECHNICIAN_DAY`: mismo `technician_normalized` y mismo
  `local_inspection_date` con distinto SHA. Se resuelve de forma automática y
  determinista con esta precedencia: (1) `COMPLETA` sobre `PARCIAL`, (2) mayor
  `metric_count`, (3) hora local más reciente, (4) desempate estable por
  `document_id` (y `inspection_id` como último criterio técnico). El ganador
  recibe su veredicto normal y entra en el KPI si califica; el perdedor queda
  `EXCLUDED` con un `reasons[]` que referencia el documento ganador como
  evidencia. Nunca se fusionan datos.

El orden de llegada de los hechos no cambia el ganador: el comparador es un
orden total sobre los hechos, así que la resolución es idempotente.

El BFF `GET /api/inspections` añade el bloque `guard` con `kpi`, `trays`
(`official`, `pending`, `observations`, `blocked`, `excluded`), `uniquenessScope`
y los `verdicts` por inspección. El KPI y el listado oficial sólo admiten `OK`;
un `WARNING` entra únicamente si la política lo autoriza y se marca con
`officialWithWarning`. No hay bandeja de duplicados: los perdedores no se pintan
y su trazabilidad (SHA, `exact_copy_of`, motivo e id del ganador) queda
solamente en `verdicts`, para auditoría. El bloque `guard` es aditivo: `data`
conserva el listado del upstream hasta que el front adopte el gating.

El scope del gating es `page`: los conteos son de la página devuelta, no del
conjunto completo, porque FastAPI aún no publica hechos agregados.


## Scope oficial explícito y trazable

El scope ya no es una constante oculta: `BACKEND_INSPECTIONS_SCOPE` acepta
`official` (por defecto) o `all`. La resolución vive en
`src/backend/composition/inspection-scope.ts` y el dominio en
`src/backend/domain/inspection-scope.ts`.

- `official`: Next envía `scope=official` y exige la atestación
  `X-Fasapi-Scope: official`; si el upstream no la emite, el BFF responde 424
  (fail closed). Es el modo seguro y el único que alimenta el KPI oficial.
- `all`: opt-in documentado. Next envía `scope=all` y no exige atestación porque
  el upstream no declara ese scope; se usa sólo para diagnóstico/auditoría y su
  impacto es que el listado deja de ser "oficial" y el gating del guard pasa a
  operar sobre el conjunto completo devuelto por el upstream.

Cambiar a `all` por defecto reduciría el gating a la lógica de etapa 2 sin el
filtro oficial de la etapa 1, por lo que queda como decisión explícita y no como
comportamiento implícito.

## Descarga y seguridad

Next sólo recibe un ID, llama al upstream con `redirect: manual`, timeout,
header contractual, token interno y `Accept: application/pdf`. Rechaza redirects,
respuestas no PDF y cuerpos sin stream. Transmite el cuerpo con
`Content-Type: application/pdf`, `Content-Disposition: attachment`, filename
saneado, `Cache-Control: private, no-store` y `X-Content-Type-Options: nosniff`.
No copia `Location`, URLs de Drive, tokens ni `drive_file_id`.

Next no escribe PDFs en disco, base de datos, Blob ni caché; sólo mantiene el
stream HTTP mientras responde. Las credenciales y la lectura de Drive quedan en
FastAPI.

## Estados y capacidades

Los adaptadores preservan y mapean 200, 202, 404, 409, 424, 502 y 503 sin
filtrar detalles internos. Las capacidades todavía no publicadas requieren
`BACKEND_DRIVE_SYNC_STATE_ENABLED` o
`BACKEND_DOCUMENT_DOWNLOAD_ENABLED=true`; por defecto están deshabilitadas.

Variables principales: `FASTAPI_API_URL`, `FASTAPI_INTERNAL_TOKEN`,
`FASTAPI_CONTRACT_VERSION`, `FASTAPI_DRIVE_CONTRACT_VERSION`,
`BACKEND_INSPECTIONS_SCOPE` y `BACKEND_TIMEOUT_MS`. Las rutas configurables son
`BACKEND_DRIVE_SYNC_PATH`, `BACKEND_DRIVE_SYNC_STATUS_PATH`,
`BACKEND_DRIVE_SYNC_RETRY_PATH`, `BACKEND_INSPECTION_DOWNLOAD_PATH` y
`BACKEND_DOCUMENT_DOWNLOAD_PATH`.

Las pruebas controladas de `tests/integration/drive-http.test.ts` no son
evidencia productiva. La comprobación live reproducible es
`npm run verify:fastapi-live`; exige URL y token internos y no inicia sync ni
reintentos salvo activación explícita.
