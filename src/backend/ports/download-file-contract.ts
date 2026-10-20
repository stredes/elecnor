export type DownloadFile = {
  readonly body: ReadableStream<Uint8Array>;
  readonly filename: string;
  readonly contentType: string;
  readonly contentLength: string | null;
};
