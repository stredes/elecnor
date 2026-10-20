export function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const HASH_B = "b".repeat(64);

export const SYNC_SUMMARY = {
  sync_id: "SYNC-1",
  drive_files_seen: 1,
  duplicate_candidates: 0,
  seleccionados: 1,
  procesados: 1,
  duplicados: 0,
  errores: 0,
  inspecciones_nuevas: 1,
  metricas_insertadas: 1,
  metricas_sin_clasificar: 0,
};

export const SYNC_STATE = {
  sync_id: "SYNC-1",
  source: "GOOGLE_DRIVE",
  status: "PARTIAL",
  requested_at: "2026-10-19T10:00:00Z",
  started_at: null,
  finished_at: null,
  retry_of: null,
  summary: SYNC_SUMMARY,
  items: [],
};
