# NP-0037: detalle, mutación y descarga de inspecciones

## Estado

**BLOQUEADA para efectos y activación.** D-03 debe formalizar el contexto
autorizado y D-08 la conservación, borrado y recuperación. Esta rama sólo
prepara caracterización y contratos; no toca DB, storage, Pages ni FastAPI.

## Caracterización legacy

- `GET /inspections/<id>` devuelve la inspección y sus métricas ordenadas; un
  ID ausente responde 404.
- `PUT /inspections/<id>` acepta una whitelist de metadata, limita strings,
  marca `PARCIAL` y no recalcula score ni métricas.
- `DELETE /inspections/<id>` elimina la fila y sus dependencias por FK; luego
  intenta borrar `stored_path`, ignorando el fallo de filesystem. Esto puede
  dejar un original huérfano y no es una política aprobada para migrar.
- `GET /inspections/<id>/pdf` sirve archivo local o URL HTTPS con bearer. La
  evidencia permite rutas absolutas fuera de una raíz y no prueba allowlist ni
  autorización de usuario.
- El BFF valida ID/campos y reenvía PUT/DELETE; no demuestra identidad, rol ni
  autorización por objeto.

## Decisiones y límites

- No se inventan roles, proveedor de identidad, retención, ventana de borrado,
  allowlist Blob ni estrategia de compensación.
- `actions` no se convierte en CRUD; editar metadata no modifica métricas.
- Podrán avanzar contratos públicos, validadores puros y fixtures sintéticas
  que reciban políticas inyectadas. No habrá adapter productivo ni endpoint.
- Después de D-03/D-08: TDD HTTP/DB/storage, rollback, cascades, streams,
  symlink/redirect/path traversal, fallo de limpieza y delete repetido.

Rollback previsto: seleccionar el reader legacy sin escribir; conservar el
original hasta la ventana aprobada y reparar mediante operación auditada.
