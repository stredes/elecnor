import { describe, expect, it } from "vitest";
import { parseDriveSyncRequest } from "@/backend/adapters/inbound/drive-sync-request";
import { parseDriveSyncStatus, parseDriveSyncSummary } from "@/backend/adapters/outbound/import-operation-parser";
import { parseInspectionList } from "@/backend/domain/inspection-list-parser";
import { parseDocumentProvenance } from "@/backend/domain/document-provenance";

const hash = "a".repeat(64);

describe("FastAPI Drive/read-model contracts", () => {
  it("preserves the real sync summary and never returns a Drive id", () => {
    const result = parseDriveSyncSummary({
      sync_id: "SYNC-1", drive_files_seen: 3, duplicate_candidates: 1, seleccionados: 3,
      procesados: 1, duplicados: 1, errores: 1, inspecciones_nuevas: 1,
      metricas_insertadas: 2, metricas_sin_clasificar: 0,
    });
    expect(result).toMatchObject({ syncId: "SYNC-1", driveFilesSeen: 3, duplicateCandidates: 1 });
    expect(result).not.toHaveProperty("drive_file_id");
  });

  it("accepts bounded sync retry correlation without accepting URLs", () => {
    expect(parseDriveSyncRequest({ limit: 20, retry_of: "SYNC-1" })).toEqual({ limit: 20, retryOf: "SYNC-1", requestId: null });
    expect(() => parseDriveSyncRequest({ url: "https://drive.google.com/file" })).toThrow();
  });

  it("maps persisted sync state and drops Drive identifiers from each item", () => {
    const result = parseDriveSyncStatus({
      sync_id: "SYNC-1", source: "GOOGLE_DRIVE", status: "PARTIAL", requested_at: "2026-10-19T10:00:00Z", started_at: null, finished_at: null, retry_of: null,
      summary: { sync_id: "SYNC-1", drive_files_seen: 1, duplicate_candidates: 1, seleccionados: 1, procesados: 1, duplicados: 0, errores: 0, inspecciones_nuevas: 1, metricas_insertadas: 1, metricas_sin_clasificar: 0 },
      items: [{ document_id: "DOC-1", inspection_id: "INS-1", filename: "audit.pdf", sha256: hash, status: "IMPORTED", duplicate_decision: "PENDING", duplicate_of_document_id: null, error: null, provenance: { document_id: "DOC-1", drive_file_id: "secret", filename: "audit.pdf", sha256: hash, origin: "GOOGLE_DRIVE" } }],
    });
    expect(result).toMatchObject({ syncId: "SYNC-1", status: "PARTIAL", items: [{ duplicateDecision: "PENDING" }] });
    expect(result.items[0].provenance).not.toHaveProperty("driveFileId");
  });

  it("normalizes inspection list provenance without exposing drive_file_id", () => {
    const row = { id: "INS-1", date: "2026-10-19", time: null, technician: null, auditor: null, address: null, city: null, region: null, percentage: null, score: null, maxScore: null, actions: null, rubric: null, status: "PARCIAL", filename: "audit.pdf", document_id: "DOC-1", provenance: { document_id: "DOC-1", drive_file_id: "drive-internal", filename: "audit.pdf", sha256: hash, origin: "GOOGLE_DRIVE", date: "2026-10-19", time: "10:30" } };
    const result = parseInspectionList({ data: [row], total: 1, limit: 25, offset: 0, dates: [], auditors: [], regions: [] });
    expect(result.data[0].provenance).toMatchObject({ documentId: "DOC-1", sha256: hash });
    expect(result.data[0].provenance).not.toHaveProperty("driveFileId");
  });

  it("validates internal Drive provenance without returning its identifier", () => {
    expect(parseDocumentProvenance({ drive_file_id: "drive-1", document_id: null, filename: null })).toEqual({ documentId: null, filename: null, sha256: null, origin: null, receivedAt: null, date: null, time: null, sha256Recalculated: null });
    expect(() => parseDocumentProvenance({ drive_file_id: 42 })).toThrow();
  });
});
