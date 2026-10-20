export type ReportExport = {
  readonly body: ReadableStream<Uint8Array>;
  readonly contentType: string;
  readonly contentLength: string | null;
  readonly filename: string;
};

export interface ReportExportReader {
  download(): Promise<ReportExport>;
}
