import { HttpDocumentDownloadReader } from "../adapters/outbound/http-document-download-reader";
import { BackendConfigurationError } from "../adapters/outbound/http-errors";
import type { DocumentDownloadReader } from "../ports/document-download-reader";
import { resolveBackendSelection } from "./backend-config";

export function createDocumentDownloadReader(fetcher?: typeof fetch): DocumentDownloadReader {
  const selection = resolveBackendSelection();
  if (selection.mode === "http" && selection.url) return new HttpDocumentDownloadReader(
    selection.url, fetcher ?? fetch, selection.paths, { contractVersion: selection.driveContractVersion, internalToken: selection.internalToken, timeoutMs: selection.timeoutMs }, selection.documentDownloadEnabled,
  );
  const error = selection.error ?? new BackendConfigurationError("El backend de documentos no está configurado.");
  return { download: async () => { throw error; } };
}

export const documentDownloadReader = createDocumentDownloadReader();
