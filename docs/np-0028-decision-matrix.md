# NP-0028 — Matriz de decisiones para CTIO

Estado: directrices técnicas comunicadas y revisadas por el CTO en la sesión del
2026-10-15; no se inventan firma, correo ni fingerprint de aprobación Brain.
Las fuentes canónicas son `NP-0026-plan.md` y `NP-0028-readiness.md`.

## D-02 — runtime y persistencia

- Problema: runtime Node/Python, SQLite durable, volumen, límites de 20×15 MiB,
  tiempo, respuesta, reinicio y riesgo de doble escritor.
- Confirmado: Flask escribe su SQLite; Fasapi registra lotes en otro SQLite. El
  spike local sync solo demuestra comportamiento sintético, no SLA ni producción.
- Alternativas: runtime durable con volumen/DB aprobados y Flask como writer
  transitorio; o medir sync aislado y cambiar a jobs durables si no alcanza.
- Recomendación: medir primero de forma aislada y aprobar runtime antes de producción.
- Consecuencia: no SQLite en Next ni activación productiva mientras falte evidencia.
- Owner: no asignado; la fuente solo propone Operaciones + Arquitectura.
- Aprobación externa: sí; runtime, capacidad, volumen, writer y rollback.
- Evidencia: prueba en runtime aprobado con límites, volumen durable, rollback y writer único.
- Afecta: NP-0028 y las activaciones de runtime/importación de NP-0030/NP-0033.

## D-03 — identidad y contexto autorizado

- Problema: las rutas observadas no implementan autenticación; existen exposición,
  IDOR y mutaciones no autorizadas como riesgos.
- Confirmado: no hay roles ni proveedor de identidad demostrados; no se inventan.
- Alternativas: IdP/sesión; o acceso anónimo únicamente en red controlada y temporal.
- Recomendación: definir `AuthorizedContext` como frontera, sin fijar roles aún.
- Consecuencia: se pueden probar límites sintéticos, no habilitar carga/descarga real.
- Owner: no asignado; se proponen Producto + Seguridad/Operaciones.
- Aprobación externa: sí; proveedor, contexto y ámbito de listar/editar/borrar/cargar.
- Evidencia: proveedor, contexto autorizado, matriz de permisos y pruebas de rechazo.
- Afecta: NP-0028, NP-0033, NP-0037, NP-0039 y release.

## D-05 — contrato documental

- Problema: Flask devuelve resumen; Fasapi devuelve documento estricto. Campos,
  orden, fecha parcial, zona, ubicación y rúbrica no son automáticamente equivalentes.
- Confirmado: Fasapi usa esquema estricto; no existe paridad real autorizada.
- Alternativas: schema aditivo versionado con ruta compatible y anti-corruption layer;
  o compatibilidad adicional explícita sin cambiar `/v1` silenciosamente.
- Recomendación: preservar v1 y extender solo con fixtures reales aprobadas.
- Consecuencia: no cerrar parser, writer ni paridad de importación con PDFs reales.
- Owner: no asignado; se proponen Arquitectura + responsable documental.
- Aprobación externa: sí; versión, campos, fixtures y consumidor estricto.
- Evidencia: schema versionado, mapping de campos, fixtures anonimizadas y compatibilidad.
- Afecta: NP-0028, NP-0031 y activación de importación de NP-0033.

## D-06 — semántica de métricas

- Problema: Excel y dashboard difieren en M-14, M-09/M-10 y ausencia cero/brecha.
- Confirmado: son variantes legacy observables; corregirlas cambiaría cifras públicas.
- Alternativas: conservar variantes explícitas; o unificarlas con aprobación funcional.
- Recomendación: mantener universos Excel/dashboard separados y nombrados.
- Consecuencia: C-IMPORT no recalcula métricas; solo devuelve contadores aprobados.
- Owner: no asignado; se propone responsable funcional de métricas.
- Aprobación externa: sí; oráculos, ejemplos y decisión de unificación.
- Evidencia: golden de M-14/M-09/M-10/M-03/M-23 y decisión funcional firmada.
- Afecta: NP-0028 y reporting de NP-0034/NP-0036/NP-0040.

## D-10 — navegador y medios externos

- Problema: tokens/PII y dependencias externas en YouTube, miniaturas y enlaces.
- Confirmado: no forma parte del flujo C-IMPORT, pero afecta el DoR global.
- Alternativas: medios públicos con allowlist/CSP; proxy arbitrario; o server-side.
- Recomendación: Next controla documentos; medios externos quedan separados y allowlisted.
- Consecuencia: no cambia `/api/import`, pero impide cerrar NP-0028 globalmente.
- Owner: no asignado; las fuentes proponen Producto + Arquitectura o Seguridad + Arquitectura.
- Aprobación externa: sí; alcance navegador→Next y allowlist final.
- Evidencia: inventario externo, allowlist/CSP final y revisión de tokens/PII.
- Afecta: DoR global y medios de NP-0043; no cambia el contrato C-IMPORT.

## Directrices CTO registradas

- D-02: PDF transitorio; FastAPI procesa y PostgreSQL recibe datos estructurados mediante puertos.
- D-03: portal público sin login; importar sí, modificar/eliminar no; el backend aplica restricciones.
- D-05: analizar formatos, normalizar sin inventar campos y extraer mediante adaptadores por formato.
- D-06: reglas y métricas en FastAPI; dashboards solo presentan resultados entregados.
- D-10: Next, FastAPI y PostgreSQL en Railway con secretos y controles de seguridad administrados.

## Clasificación del DoR

- Resuelto: Brain 5.0.1 y validación local; no es una de estas cinco decisiones.
- Resoluble técnicamente ahora: contrato de compatibilidad, límites hexagonales y
  fixture conceptual de TEST-01, sin efectos externos ni cambios de producción.
- Pendiente de formalizar owner/evidencia para DoR: D-02, D-03, D-05, D-06 y D-10.
  La directriz revisada no cambia `ready=false` ni cierra la activación.

## Regularización de TEST-03

- Clasificación: AC-03 es control administrativo; no simula una aprobación de
  producción y no debe cerrarse con un cambio artificial en `src/` o `pages/`.
- Brain 5.0.1 no ofrece un tipo de test administrativo ni un subcomando de
  aceptación humana para cerrar un AC. Las reviews aceptadas requieren evidencia
  manual y commit firmado con `HC-Task` y `HC-Review`.
- `hc tdd restart TEST-03 --reason "..."` conserva el evento histórico, retira el
  ciclo incompleto y exige registrar otro RED; no reclasifica la historia.
- `rebaseline` no aplica: requiere el último ciclo completo y cambio real de
  producción. No se ejecuta ninguna regularización hasta aprobar el reemplazo.
