import { BackendConfigurationError } from "../adapters/outbound/http-errors";
import { HttpProcedureDownloadReader } from "../adapters/outbound/http-procedure-download-reader";
import type { ProcedureDownloadReader } from "../ports/procedure-download-reader";
import { resolveBackendSelection } from "./backend-config";

export function createProcedureDownloadReader(fetcher?: typeof fetch): ProcedureDownloadReader {
  const selection = resolveBackendSelection();
  if (selection.mode === "http" && selection.url) return new HttpProcedureDownloadReader(
    selection.url, fetcher ?? fetch, selection.paths.procedures,
    { contractVersion: selection.driveContractVersion, internalToken: selection.internalToken, timeoutMs: selection.timeoutMs },
  );
  const error = selection.error ?? new BackendConfigurationError("El backend de procedimientos no está configurado.");
  return { download: async () => { throw error; } };
}

export const procedureDownloadReader = createProcedureDownloadReader();
