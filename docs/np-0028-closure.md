# NP-0028 — Cierre administrativo C-IMPORT

- Fecha: 2026-10-15
- Estado: **BLOCKED EXTERNAL / NO-GO**
- Tipo: cierre administrativo local; no es DONE ni READY.

## Decisión Brain

Brain 5.0.1 no ofrece comando de cierre administrativo, archivo NO-GO ni
transición de historia bloqueada. Se conserva el estado canónico y se registra
este documento como acta final local. `story validate --done` no se utiliza para
forzar un cierre; su resultado es story no Ready.

## Alcance técnico entregado

- Validación pura de selección: 20 PDFs, 15 MiB y extensión `.pdf`.
- Parser multipart `files`, parser estricto de siete contadores y errores 400/502/503.
- Caso de uso `ImportFiles`, puerto `ImportGateway` y adaptador outbound deshabilitado.
- BFF Pages Router `POST /api/import` con 503 controlado, sin forwarding ni SQLite.
- No se habilitó extracción, deduplicación productiva ni persistencia documental.

## Evidencia y validación

- TEST-01/02/04/05/06/07/08: DONE.
- TEST-03: RED histórico conservado; `CYCLE_RESTARTED` oficial; sin GREEN/REFACTOR.
- Unitarias: 28/29; integración: 23/24; el único fallo es TEST-03 esperado.
- E2E HTTP: 3/3 PASS; ESLint, TypeScript y build: PASS.
- `hc validate`, `hc doctor`, `hc story validate` y `hc gates`: PASS.
- `hc verify`: BLOCKED — `TEST-03 has no RED/GREEN evidence`.
- DoR: `ready=false`; `story validate --done`: story no Ready.
- No existe review humana aceptada ni aprobación CTIO registrada.

## Decisiones y riesgos externos

- D-02: runtime, capacidad, volumen, writer único y rollback.
- D-03: identidad, contexto autorizado y permisos.
- D-05: schema documental, mapping y fixtures aprobadas.
- D-06: semántica funcional de métricas.
- D-10: allowlist, CSP y medios externos.

D-02, D-03 y D-05 bloquean la activación funcional de C-IMPORT. D-06 y D-10
mantienen bloqueado el DoR global. No se inventaron owners ni aprobaciones.

## Reapertura

1. Obtener owners y aprobación formal de D-02, D-03 y D-05.
2. Resolver D-06 y D-10 para el DoR global.
3. Regularizar TEST-03 mediante review humana o reemplazo técnico autorizado.
4. Completar integración documental, ejecutar `hc verify` PASS y aceptar el release.

## Trazabilidad e integridad

Commits: `e0fc45d`, `b040726`, `eb75279`, `70e0e38`, `c5c7f33`, `57a0766`,
`c0fb61c` y `2f34e59`. Legacy, `main` y `Development` permanecen intactos;
no hubo push, merge ni despliegue.
