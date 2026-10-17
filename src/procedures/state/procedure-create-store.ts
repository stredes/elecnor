import type { ProcedureDraft } from "../contracts/procedure-form-contract";
import type { ProcedureCreateState, ProcedureCreateStore } from "./procedure-create-store-contract";

export function createProcedureCreateStore(draft: ProcedureDraft): ProcedureCreateStore {
  let state: ProcedureCreateState = { status: "idle", draft, requestId: 0, procedureId: null, errors: [], fileReleased: false };
  let nextRequestId = 0;
  const listeners = new Set<() => void>();
  const publish = (next: ProcedureCreateState) => { state = next; listeners.forEach((listener) => listener()); };
  const isCurrent = (requestId: number) => requestId === state.requestId;

  return {
    getState: () => state,
    submit: () => {
      const requestId = ++nextRequestId;
      publish({ ...state, status: "submitting", requestId, procedureId: null, errors: [], fileReleased: false });
      return requestId;
    },
    resolve: (requestId, procedureId) => {
      if (!isCurrent(requestId)) return;
      publish({ ...state, status: "success", procedureId, errors: [], fileReleased: true });
    },
    reject: (requestId, errors) => {
      if (!isCurrent(requestId)) return;
      publish({ ...state, status: "error", procedureId: null, errors: [...errors], fileReleased: true });
    },
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
  };
}
