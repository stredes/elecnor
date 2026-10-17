import type { InspectionListResult } from "@/backend/domain/inspection-list-contract";
import type { InspectionFilterState, InspectionFilterStore, InspectionFilterValues } from "./inspection-filter-contract";

export const INSPECTION_SEARCH_DEBOUNCE_MS = 350;

export function createInspectionFilterStore(initial: InspectionFilterValues): InspectionFilterStore {
  let state: InspectionFilterState = { status: "idle", applied: initial, draft: initial, pending: null, requestId: 0, result: null, error: null };
  let nextRequestId = 0;
  const listeners = new Set<() => void>();
  const publish = (next: InspectionFilterState) => { state = next; listeners.forEach((listener) => listener()); };
  const request = (filters: InspectionFilterValues): number => {
    const requestId = ++nextRequestId;
    publish({ ...state, status: "loading", applied: filters, draft: filters, pending: null, requestId, result: null, error: null });
    return requestId;
  };
  return {
    getState: () => state,
    edit: (field, value) => {
      if (state.status === "disposed") return;
      const draft = { ...state.draft, [field]: value };
      publish({ ...state, status: "debouncing", draft, pending: draft, error: null });
    },
    flushSearch: () => request(state.pending ?? state.draft),
    select: (field, value) => request({ ...state.draft, [field]: value }),
    resolve: (requestId, result: InspectionListResult) => {
      if (state.status === "disposed" || requestId !== state.requestId) return;
      publish({ ...state, status: result.total > 0 ? "ready" : "empty", result, error: null });
    },
    reject: (requestId, error) => {
      if (state.status === "disposed" || requestId !== state.requestId) return;
      publish({ ...state, status: "error", result: null, error });
    },
    dispose: () => { if (state.status !== "disposed") { publish({ ...state, status: "disposed", pending: null }); listeners.clear(); } },
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
  };
}
