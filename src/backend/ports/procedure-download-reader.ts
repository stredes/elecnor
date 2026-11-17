import type { DocumentDownload } from "./document-download-reader";

export interface ProcedureDownloadReader {
  download(id: string, downloadAssertion?: string): Promise<DocumentDownload>;
}
