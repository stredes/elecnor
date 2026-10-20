import { HttpProcedureReader } from "../adapters/outbound/http-procedure-reader";
import { MemoryProcedureReader } from "../adapters/outbound/memory-procedure-reader";
import type { ProcedureReader } from "../ports/procedure-reader";
import { resolveBackendSelection } from "./backend-config";

export function createProcedureReader(fetcher?: typeof fetch): ProcedureReader {
  const selection = resolveBackendSelection();
  if (selection.mode === "http" && selection.url) return new HttpProcedureReader(
    selection.url, fetcher ?? fetch, selection.paths.procedures,
    { contractVersion: selection.contractVersion, internalToken: selection.internalToken, timeoutMs: selection.timeoutMs },
  );
  if (selection.mode === "memory") return new MemoryProcedureReader();
  const error = selection.error ?? new Error("Backend no configurado.");
  return { catalog: async () => { throw error; }, detail: async () => { throw error; } };
}

export const procedureReader = createProcedureReader();
