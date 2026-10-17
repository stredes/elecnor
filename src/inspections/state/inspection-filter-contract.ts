import type { InspectionListResult } from "@/backend/domain/inspection-list-contract";

export type InspectionFilterValues = {
  readonly q: string;
  readonly technician: string;
};

export type InspectionFilterState = {
  readonly status: "idle" | "debouncing" | "loading" | "ready" | "empty" | "error" | "disposed";
  readonly applied: InspectionFilterValues;
  readonly draft: InspectionFilterValues;
  readonly pending: InspectionFilterValues | null;
  readonly requestId: number;
  readonly result: InspectionListResult | null;
  readonly error: string | null;
};

export type InspectionFilterStore = {
  getState(): InspectionFilterState;
  edit(field: keyof InspectionFilterValues, value: string): void;
  flushSearch(): number;
  select(field: keyof InspectionFilterValues, value: string): number;
  resolve(requestId: number, result: InspectionListResult): void;
  reject(requestId: number, error: string): void;
  dispose(): void;
  subscribe(listener: () => void): () => void;
};
