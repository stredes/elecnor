export interface CancellationPort {
  isCancelled(): boolean;
}

export type ImportExecutionContext = {
  readonly requestId: string;
  readonly cancellation: CancellationPort;
};
