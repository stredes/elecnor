import type { MetricSelection, MetricSelectionState, MetricSelectionStore } from "./metric-selection-contract";

const initialState: MetricSelectionState = {
  status: "idle", selectedCode: null, selection: null, error: null, requestId: 0,
};

export function createMetricSelectionStore(): MetricSelectionStore {
  let state = initialState;
  let nextRequestId = 0;
  const listeners = new Set<() => void>();
  const publish = (next: MetricSelectionState) => { state = next; listeners.forEach((listener) => listener()); };
  const isCurrent = (requestId: number) => requestId === state.requestId;

  return {
    getState: () => state,
    begin: (code) => {
      const requestId = ++nextRequestId;
      publish({ status: "loading", selectedCode: code, selection: null, error: null, requestId });
      return requestId;
    },
    resolve: (requestId, selection: MetricSelection | null) => {
      if (!isCurrent(requestId)) return;
      publish({ status: selection ? "ready" : "empty", selectedCode: state.selectedCode, selection, error: null, requestId });
    },
    reject: (requestId, error) => {
      if (!isCurrent(requestId)) return;
      publish({ status: "error", selectedCode: state.selectedCode, selection: null, error, requestId });
    },
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
  };
}
