import { ListInspections } from "../application/list-inspections";
import { ListGuardedInspections } from "../application/guard/list-guarded-inspections";
import { GetInspectionDetail } from "../application/inspections/get-inspection-detail";
import { HttpInspectionReader } from "../adapters/outbound/http-inspection-reader";
import { HttpInspectionDetailReader } from "../adapters/outbound/http-inspection-detail-reader";
import { MemoryInspectionReader } from "../adapters/outbound/memory-inspection-reader";
import { syntheticInspectionDetail } from "./synthetic-inspection-entrypoint";
import type { InspectionReader } from "../ports/inspection-reader";
import type { ReadInspectionDetail } from "../ports/read-inspection-detail";
import { resolveBackendSelection } from "./backend-config";
import { inspectionScopeOptions, resolveInspectionScope } from "./inspection-scope";

export function createInspectionReader(fetcher?: typeof fetch): InspectionReader {
  const selection = resolveBackendSelection();
  const scope = resolveInspectionScope();
  if (selection.mode === "http" && selection.url) return new HttpInspectionReader(
    selection.url, fetcher ?? fetch, selection.paths.inspections,
    inspectionScopeOptions(
      { contractVersion: selection.contractVersion, internalToken: selection.internalToken, timeoutMs: selection.timeoutMs },
      scope,
    ),
    scope,
  );
  if (selection.mode === "memory") return new MemoryInspectionReader();
  return { list: async () => { throw selection.error ?? new Error("Backend no configurado."); } };
}

export function createInspectionQuery(fetcher?: typeof fetch) {
  const reader = createInspectionReader(fetcher);
  return new ListInspections(reader);
}

export function createGuardedInspectionQuery(fetcher?: typeof fetch) {
  return new ListGuardedInspections(createInspectionReader(fetcher));
}

export function createInspectionDetailQuery(fetcher?: typeof fetch) {
  const selection = resolveBackendSelection();
  const scope = resolveInspectionScope();
  const reader: ReadInspectionDetail = selection.mode === "http" && selection.url
    ? new HttpInspectionDetailReader(
      selection.url, fetcher ?? fetch, selection.paths.inspections,
      inspectionScopeOptions(
        { contractVersion: selection.contractVersion, internalToken: selection.internalToken, timeoutMs: selection.timeoutMs },
        scope,
      ),
      scope,
    )
    : selection.mode === "memory"
      ? { read: (id: string) => syntheticInspectionDetail.execute(id) }
      : { read: async () => { throw selection.error ?? new Error("Backend no configurado."); } };
  return new GetInspectionDetail(reader);
}

export const inspectionQuery = createInspectionQuery();
export const guardedInspectionQuery = createGuardedInspectionQuery();
export const inspectionDetailQuery = createInspectionDetailQuery();
