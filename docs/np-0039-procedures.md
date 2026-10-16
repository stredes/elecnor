# NP-0039 — Contratos sintéticos de alta compensada

## Estado

Este incremento prepara contratos y dobles en `NP-0039`. No activa POST,
multipart, FastAPI, DB, Blob, filesystem, SQLite, OCR ni datos reales.
`D-02`, `D-03`, `D-08`, C-VALIDATE y `REVIEW-01` continúan pendientes.

## Contratos

- `ValidateProcedurePdf` devuelve validez técnica y código seguro; no exige
  formato Mitti y no interpreta métricas.
- `StoreProcedureDocument` separa `put/remove` y solo expone un identificador
  interno del documento almacenado.
- `CommitProcedure` reserva por clave y fingerprint, confirma, devuelve
  duplicado o conflicto y permite cancelar una reserva conocida.
- `RecordProcedureRecovery` registra únicamente clave, reserva, documento,
  motivo y estado de recuperación; nunca contenido PDF ni secretos.

## Flujo probado

1. Validar metadata y PDF mediante puertos.
2. Reservar idempotencia antes de escribir storage.
3. Crear documento sintético y confirmar el registro por el committer.
4. Ante fallo conocido, limpiar y liberar la reserva.
5. Ante resultado incierto de storage/DB, registrar recovery y no borrar ni
   reintentar silenciosamente.
6. Repetir la misma clave y fingerprint devuelve el procedimiento previo;
   otro fingerprint produce conflicto.
7. Una reserva pendiente para la misma clave produce conflicto; sólo una
   cancelación conocida libera la clave para otro intento.
8. Un error de storage sin estado conocido se trata como incierto y queda
   para conciliación; no se libera la reserva ni se borra a ciegas.

## Evidencia

`TEST-01`, `TEST-02` y `TEST-03` tienen RED/GREEN/REFACTOR y rebaseline del
gate de límites. Pasan typecheck, lint, unitarias, integración y la suite E2E
existente. Los dobles son de memoria y no realizan llamadas externas.

La activación real queda fuera de este commit hasta que el CTO complete D-02,
D-03, D-08 y C-VALIDATE, y se registre la attestation `HC-Review`.
