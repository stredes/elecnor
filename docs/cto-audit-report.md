# Informe de auditoría técnica para CTO

> Este documento es el baseline histórico de la auditoría del 2026-10-16. El
> estado posterior de contratos y adaptadores está en
> `docs/np-migration-status-v1-v10.md`; no usar esta fotografía como inventario
> vigente de rutas.

## Proyecto

**Elecnor — revisión NP-0001 a NP-0043**
**Checkout auditado:** `NP-0043` / `9ceb433`
**Fecha:** 2026-10-16
**Alcance:** reviews, attestations y conexión backend–API–frontend.

## 1. Dictamen ejecutivo

El checkout mantiene correctamente el límite autorizado: **datos sintéticos,
Pages Router, composición hexagonal y APIs de contrato**, sin activar backend
real, base de datos, mutaciones, almacenamiento, PDFs reales ni vídeo externo.

La conexión efectiva actual es:

```text
Pages SSR → composición sintética → aplicación/dominio → props → Views
```

No existe actualmente una conexión productiva frontend → API → FastAPI/DB.
Las APIs preparadas son límites server-side independientes y sus adaptadores
reales permanecen opcionales o deshabilitados.

**Conclusión:** el estado es técnicamente consistente con D-10 y con los límites
de las NPs, pero no debe interpretarse como aprobación productiva ni como cierre
global de `REVIEW-01`.

## 2. Estado de reviews y attestations

| NP | Estado de `REVIEW-01` | Evidencia / interpretación |
|---|---|---|
| NP-0001 | Pendiente | La story exige review; el expediente no tiene attestation ni ciclos finales. |
| NP-0028 | No aplica | La story no declara `REVIEW-01`. Estado técnico: DONE / NO-GO productivo. |
| NP-0029 | Pendiente | Review requerida; no hay aceptación registrada. |
| NP-0030 | Pendiente | Bloqueada por attestation humana, D-05 y D-11. |
| NP-0031 | Pendiente | Review requerida; no hay aceptación registrada. |
| NP-0032 | Pendiente | Review requerida; no hay aceptación registrada. |
| NP-0033 | Pendiente | Review requerida; activación condicionada por D-02, D-03, D-05 y D-08. |
| NP-0034 | Pendiente | Las decisiones CTO no cierran `REVIEW-01`. D-06 y golden formal pendientes. |
| NP-0035 | **Aceptada sólo para Development** | Attestation registrada en `6e241cd`; no concede GO productivo. Reader sintético y golden legacy formal siguen pendientes. |
| NP-0036 | Pendiente | Review requerida; geocodificación, backfill y datos reales no activados. |
| NP-0037 | Pendiente / bloqueada | D-03 y D-08 pendientes; no hay endpoints mutables ni storage activo. |
| NP-0038 | Pendiente; expediente ausente | No existe `.hc/evidence/NP-0038.json`. La decisión CTO publicada no equivale a review aceptada. |
| NP-0039 | Pendiente; expediente ausente | No existe `.hc/evidence/NP-0039.json`. No hay autorización de activación. |
| NP-0040 | Pendiente | Contrato de exportación sintético; no existe endpoint activo. |
| NP-0041 | Pendiente | Review y baseline visual reproducible pendientes. |
| NP-0042 | **Abierta** | Expediente explícito: límites de estado, aislamiento SSR y ausencia de mutaciones. |
| NP-0043 | **Abierta** | Expediente explícito: D-10, same-origin, medios externos y estado de alta. |

### Nota sobre la attestation de NP-0035

`.hc/evidence/NP-0035.json` registra `REVIEW-01` como `accepted` para
Development, vinculada al commit firmado `6e241cdc`. La firma Git está presente;
este entorno no contiene la clave pública para validarla criptográficamente.
La aceptación no autoriza producción ni cierra las deudas de golden o reader.

Las decisiones CTO publicadas para NP-0034–NP-0039 son decisiones de diseño y
no deben contarse automáticamente como aceptación de `REVIEW-01`.

## 3. Inventario de APIs

| Endpoint | Backend conectado | Estado |
|---|---|---|
| `GET /api/health` | Respuesta estática de Next | Activo como health check. |
| `GET /api/dashboard` | `dashboardQuery`; HTTP sólo si existe `BACKEND_API_URL`, si no memoria | Contrato activo; no consumido por las páginas actuales. |
| `GET /api/inspections` | `inspectionQuery`; HTTP sólo si existe `BACKEND_API_URL`, si no memoria | Contrato activo; la página actual usa composición sintética directa. |
| `POST /api/import` | `ImportFiles` + `DisabledImportGateway` | Límite activo; una importación válida devuelve `503` controlado. |
| FastAPI `/api/v1/pdf/extract` | `HttpCExtractReader` sólo mediante `FASTAPI_API_URL` | Adaptador preparado, no activado ni expuesto por una página. |
| `/api/procedures` | No existe | No hay catálogo persistente ni alta real. |
| `/api/inspections/[id]` | No existe | No hay PUT, DELETE ni descarga PDF real. |
| `/api/export/excel` | No existe | NP-0040 permanece sintética. |

No se encontraron llamadas `fetch` del frontend hacia estas APIs. El único
enlace visible de API en la presentación legacy es el health check.

## 4. Conexión por NP

| NP | Backend / dominio | API | Frontend |
|---|---|---|---|
| NP-0001 | Core hexagonal y reader de dashboard | Dashboard y health | Dashboard sintético SSR. |
| NP-0028 | Contratos C-IMPORT, validadores y puertos | `/api/import` con gateway deshabilitado | Toolbar de importación deshabilitado. |
| NP-0029 | Scanners de líneas, límites y contratos | No aplica | No aplica; es infraestructura de calidad. |
| NP-0030 | Query, parser y `InspectionReader` | `/api/inspections` con memory/HTTP opcional | `/inspecciones` usa `syntheticInspectionQuery`, no el API. |
| NP-0031 | Puerto C-EXTRACT y adaptador HTTP | FastAPI opcional, disabled por defecto | Sin consumidor frontend activo. |
| NP-0032 | Interpretación, catálogo, geografía y completitud pura | Ninguna | Ninguno. |
| NP-0033 | Coordinador de importación y `RepositoryPort` | `/api/import` no reenvía a FastAPI | Sin escritura; toolbar deshabilitado. |
| NP-0034 | KPIs, percentiles y bandas | No se conectan a `/api/dashboard` | Dashboard/métricas usan reporting sintético. |
| NP-0035 | Detalle, aprobaciones, rankings y narrativa | Sin endpoint de reporting | Dashboard y `/test-reporting` usan readers sintéticos. |
| NP-0036 | Territorio, series y perfil técnico | Sin endpoints activos | `/tecnicos/[nombre]` usa facts sintéticos. |
| NP-0037 | Detalle, policies de mutación y descarga segura | No existen endpoints mutables | Detalle sintético de sólo lectura. |
| NP-0038 | Contratos de catálogo | Sin API de procedimientos | Preparación conceptual; sin persistencia activa. |
| NP-0039 | Contratos/policies de alta | No existe `POST /api/procedures` | Store y formulario sintéticos. |
| NP-0040 | Snapshot y renderer en memoria | Sin exportación HTTP | Botón Excel deshabilitado. |
| NP-0041 | Composición dashboard/reporting sintética | API dashboard no usada por las páginas | `/`, `/dashboard`, `/metricas` y detalle SSR sintéticos. |
| NP-0042 | Loaders sintéticos de inspección, detalle y técnico | API de inspecciones no usada por las páginas | `/inspecciones`, detalle y técnico activos con fixtures. |
| NP-0043 | Catálogo/detalle de procedimientos y store de alta | No existe API de procedimientos | `/procedimientos` y detalle sintéticos; medios externos bloqueados. |

## 5. Rutas frontend actualmente activas

| Rutas | Fuente de datos actual |
|---|---|
| `/`, `/dashboard`, `/metricas`, `/metricas/[slug]` | `syntheticDashboardQuery` y `syntheticReportingQuery`. |
| `/inspecciones`, `/inspecciones/[id]`, `/tecnicos/[nombre]` | `syntheticInspectionQuery`, `syntheticInspectionDetail` y perfil sintético. |
| `/procedimientos`, `/procedimientos/[id]` | `syntheticProcedureCatalog` y `syntheticProcedureDetail`. |
| `/test-reporting` | Reader de memoria exclusivo para pruebas E2E. |

Las páginas delegan en Views y los componentes no conocen endpoints internos,
reglas de agrupación, persistencia ni servicios externos.

## 6. Riesgos y bloqueos abiertos

1. `REVIEW-01` de NP-0043 requiere attestation humana del CTO sobre D-10,
   same-origin, medios externos y alta sintética.
2. `REVIEW-01` de NP-0042 permanece abierta para estado, carreras SSR y ausencia
   de mutaciones.
3. Las NPs históricas con review requerida no tienen aceptación formal, salvo
   NP-0035 con alcance limitado a Development.
4. NP-0038 y NP-0039 no tienen expediente de evidencia `.hc/evidence`.
5. D-02, D-03, D-05, D-06, D-08, D-10 y D-11 continúan condicionando cualquier
   activación real de backend, documentos, métricas, storage o medios.
6. `hc context` excede el presupuesto configurado: 9706 tokens frente a 7000.
   Es una limitación del contexto de Brain, no un fallo funcional del código.

## 7. Petición de decisión al CTO

Se solicita confirmar explícitamente:

- [ ] Mantener NP-0042 y NP-0043 en estado abierto hasta completar attestation.
- [ ] Confirmar que el estado sintético actual no constituye GO productivo.
- [ ] Confirmar que las decisiones documentales NP-0034–NP-0039 no sustituyen
      las reviews formales pendientes.
- [ ] Definir si NP-0001, NP-0029–NP-0034 y NP-0036–NP-0041 requieren reviews
      individuales o una revisión consolidada con fingerprints por commit.
- [ ] Completar o declarar formalmente fuera de alcance los expedientes de
      evidencia faltantes de NP-0038 y NP-0039.
- [ ] Mantener bloqueadas las conexiones reales hasta resolver las decisiones
      de identidad, persistencia, contratos, métricas, storage y medios.

## 8. Estado de verificación

- `hc verify`: todos los controles pasan salvo `REVIEW-01` no resuelta del task
  activo NP-0043.
- `hc next`: `DONE`, sin siguiente NP definida.
- Git: el árbol estaba limpio en `NP-0043` al iniciar la auditoría; el único
  cambio no comprometido posterior es este informe.
- No se modificó código durante esta auditoría.

## 9. Dictamen final

La arquitectura y los límites de seguridad están respetados. El sistema está
preparado para una futura conexión por puertos y adaptadores, pero **no existe
una integración productiva back–API–front que pueda aprobarse como desplegable**.

El único cierre de review registrado es NP-0035 con alcance restringido a
Development. NP-0042 y NP-0043 deben permanecer abiertas hasta la attestation
del CTO y la resolución explícita de sus decisiones pendientes.
