# NP-0038: catálogo de procedimientos

## Estado

**LECTURA Y REGLAS PURAS.** Esta rama conserva el contrato de lectura y las
políticas del catálogo y activa sólo GET read-only en el BFF con fixtures
sintéticas. No activa alta, upload, descarga, delete, SQLite ni Blob; la mutación
documental pertenece a NP-0039.

## Evidencia legacy

- `app/domain/procedures.py`: límites, trimming, PDF obligatorio y extracción de
  IDs YouTube desde ID, `watch`, `youtu.be`, `embed`, `shorts` y `live`.
- `app/services/procedure_store.py`: contrato público, filtros `q`/`area`, total,
  orden por área/título y separación de `stored_path`.
- `app/api.py:252-290`: GET de lista/detalle y POST heredado; sólo el contrato GET
  se proyecta al BFF. El POST no se activa porque requiere NP-0039.
- `web/src/domain/procedure.ts` y sus mappers: familias por código+título,
  variantes ordenadas por área española y conteo de videos.

## Riesgos y límites

- No inventar allowlists de Blob ni cambiar el comportamiento YouTube
  caracterizado sin una decisión explícita.
- La URL pública del PDF se conserva como dato; `stored_path` no cruza el DTO.
- Los tests usan fixtures sintéticas y repositorios en memoria; no acceden a
  SQLite, filesystem, red ni datos reales.

Rollback: retirar las rutas GET y mantener el reader legacy read-only; no se
modifican tablas ni archivos históricos.
