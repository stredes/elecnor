# Candidato inicial de migración: NP-0028 / C-IMPORT

Estado: **preparado técnicamente como propuesta; no iniciado ni autorizado para
migración funcional**.

## Legacy analizado

- BFF actual: `np0028-web/web/src/app/api/import/route.ts`.
- Mapeo: `np0028-web/web/src/infrastructure/mappers/importSummary.ts`.
- Contrato: `np0028-web/web/tests/contracts/import-summary.test.ts`.
- E2E y upstream sintético: `np0028-web/web/tests/e2e/c-import.spec.ts` y `support/upstream.mjs`.
- Evidencia y bloqueos: `np0028-web/web/.hc/`.

La responsabilidad observada es adaptar una respuesta HTTP de importación y
traducir sus errores; no incluye persistencia directa desde el BFF.

## Proyección propuesta

| Legacy | Elecnor |
| --- | --- |
| Route Handler App Router | `pages/api/import.ts` |
| mapper HTTP | adaptador/mapeador en `src/backend/adapters/` |
| contrato de importación | puerto y tipos en `src/backend/ports/` |
| comportamiento de negocio | caso de uso en `src/backend/application/` |
| upstream sintético | fixture/adaptador de test |

## Secuencia autorizable

1. Reproducir RED con el contrato observado y fixture sintética.
2. Definir puerto, mapper y errores sin copiar implementaciones legacy.
3. Implementar GREEN mínimo para 200/502.
4. Ejecutar regresión, E2E HTTP real y REFACTOR.
5. Registrar evidencia Brain y revisión de compatibilidad.

## Bloqueos actuales

NP-0028 legacy conserva bloqueos de contexto, TDD, owners/evidencia y deuda de
99 líneas. No existe autorización CTIO para iniciar esta migración en Elecnor;
por eso el plan no crea código funcional ni altera repositorios históricos.
