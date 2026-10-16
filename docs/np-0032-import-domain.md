# NP-0032 — Interpretación funcional en TypeScript

## Estado y alcance

`NP-0032` nace directamente de `NP-0031`. Migra políticas puras para interpretar
hechos ya extraídos; no lee PDF, no llama Python, no accede a SQL/SQLite, no usa
HTTP ni activa persistencia. No se añadieron dependencias ni datos reales.

## Inventario legacy y decisiones

Se revisaron `normalization.py`, `metrics_equivalence.py`, `services/catalog.py`,
`geography.py`, `parser.py` e `importer.py:123-200`, además de sus pruebas de
parser, importer y geografía.

- Se conserva NFKD, eliminación de marcas, `casefold` equivalente, estados y
  flags: CONFORME, NO_CONFORME, NA y DESCONOCIDO.
- El catálogo conserva las 49 definiciones observadas, keywords, orden y
  precedencia. El fallback usa coincidencia exacta, contenido único y
  `SequenceMatcher` con umbral `0.88`.
- La geografía conserva aliases y regiones canónicas observadas. No se agregan
  ciudades ni heurísticas no presentes en legacy.
- La rúbrica conserva `RUBRICA_47_9`, `RUBRICA_24_4` y
  `RUBRICA_DESCONOCIDA`; la clave lógica recibe el hash por dependencia explícita.
- La completitud sigue siendo `COMPLETA` sólo con técnico, fecha y métricas; sin
  métricas se rechaza. Porcentajes y fechas ausentes permanecen `null`.

## Proyección implementada

- `import-facts-contract.ts` y `import-draft-contract.ts` separan hechos y
  borradores.
- `InterpretDocument` coordina políticas y depende sólo de `CatalogReader` y
  `HashPort`; no persiste ni decide métricas de dashboard.
- `catalog/`, `geography/`, `import-normalization.ts`, `import-rubric.ts`,
  `logical-key.ts` y `determine-import-status.ts` son dominio puro.
- `import-domain-contract.ts` publica tipos y funciones para reutilización local.

## Evidencia

`NP-0032/TEST-01`, `TEST-02` y `TEST-03` tienen RED/GREEN/REFACTOR y sus
rebaselines registrados en `.hc/evidence/NP-0032.json`. Los fixtures son
sintéticos. Unitarias: 58/58; integración: 53/53; quality, lint y typecheck
PASS durante la implementación.

`hc gates` debe permanecer PASS. El cierre formal no fabrica `REVIEW-01` ni
aprobaciones de D-05/D-06/D-11; la suite no conecta datos reales ni producción.
