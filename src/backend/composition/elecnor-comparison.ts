import { HttpElecnorComparisonReader } from "../adapters/outbound/elecnor-reader";
import { MemoryElecnorComparisonReader } from "../adapters/outbound/memory-elecnor-reader";
import type { ElecnorComparisonReader } from "../ports/elecnor-comparison-reader";
import { resolveBackendSelection } from "./backend-config";
export function createElecnorComparisonReader(fetcher?: typeof fetch): ElecnorComparisonReader {
  const selection = resolveBackendSelection();
  if (selection.mode === "http" && selection.url) return new HttpElecnorComparisonReader(selection.url, fetcher ?? fetch, selection.paths.elecnorComparison, { contractVersion: selection.contractVersion, internalToken: selection.internalToken, timeoutMs: selection.timeoutMs });
  if (selection.mode === "memory") return new MemoryElecnorComparisonReader();
  return { list: async () => { throw selection.error ?? new Error("Backend no configurado."); }, update: async () => { throw selection.error ?? new Error("Backend no configurado."); } };
}
export const elecnorComparisonReader = createElecnorComparisonReader();
