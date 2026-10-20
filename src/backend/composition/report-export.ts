import { BackendConfigurationError } from "../adapters/outbound/http-errors";
import { HttpReportExportReader } from "../adapters/outbound/http-report-export-reader";
import type { ReportExportReader } from "../ports/report-export-reader";
import { resolveBackendSelection } from "./backend-config";

export function createReportExportReader(fetcher?: typeof fetch): ReportExportReader {
  const selection = resolveBackendSelection();
  if (selection.mode === "http" && selection.url) {
    return new HttpReportExportReader(selection.url, fetcher ?? fetch, selection.paths.excel,
      { contractVersion: selection.contractVersion, internalToken: selection.internalToken, timeoutMs: selection.timeoutMs });
  }
  const error = selection.error ?? new BackendConfigurationError("El backend de exportación no está configurado.");
  return { download: async () => { throw error; } };
}

export const reportExportReader = createReportExportReader();
