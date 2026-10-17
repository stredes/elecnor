export type MetricSelection = {
  readonly code: string;
  readonly label: string;
};

export type MetricSelectionState = {
  readonly status: "idle" | "loading" | "ready" | "empty" | "error";
  readonly selectedCode: string | null;
  readonly selection: MetricSelection | null;
  readonly error: string | null;
  readonly requestId: number;
};

export type MetricSelectionStore = {
  getState(): MetricSelectionState;
  begin(code: string): number;
  resolve(requestId: number, selection: MetricSelection | null): void;
  reject(requestId: number, error: string): void;
  subscribe(listener: () => void): () => void;
};
