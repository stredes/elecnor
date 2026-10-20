import type { DownloadFile } from "./download-file-contract";

export type DocumentDownloadKind = "inspection" | "document";
export type DocumentDownload = DownloadFile & { readonly contentType: "application/pdf" };

export interface DocumentDownloadReader {
  download(kind: DocumentDownloadKind, id: string): Promise<DocumentDownload>;
}
