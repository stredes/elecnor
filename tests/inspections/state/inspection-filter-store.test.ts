import { describe, expect, it } from "vitest";
import type { InspectionListResult } from "@/backend/domain/inspection-list-contract";
import { createInspectionFilterStore, INSPECTION_SEARCH_DEBOUNCE_MS } from "@/inspections/state/inspection-filter-store";

const emptyResult = { data: [], total: 0, limit: 25, offset: 0, dates: [], auditors: [], regions: [] } satisfies InspectionListResult;

describe("NP-0042/AC-02/TEST-02 inspection filter store", () => {
  it("keeps q in draft until debounce and applies selection immediately", () => {
    const store = createInspectionFilterStore({ q: "", technician: "" });
    store.edit("q", "Técnico");
    expect(store.getState()).toMatchObject({ status: "debouncing", applied: { q: "" }, draft: { q: "Técnico" }, pending: { q: "Técnico" } });
    expect(INSPECTION_SEARCH_DEBOUNCE_MS).toBe(350);

    const searchRequest = store.flushSearch();
    expect(store.getState()).toMatchObject({ status: "loading", applied: { q: "Técnico" }, requestId: searchRequest });
    const selectionRequest = store.select("technician", "Técnico A");
    store.resolve(searchRequest, emptyResult);
    expect(store.getState()).toMatchObject({ status: "loading", requestId: selectionRequest, applied: { technician: "Técnico A" } });
    store.resolve(selectionRequest, emptyResult);
    expect(store.getState()).toMatchObject({ status: "empty", result: emptyResult });
  });

  it("ignores stale responses and makes cleanup deterministic", () => {
    const store = createInspectionFilterStore({ q: "", technician: "" });
    const oldRequest = store.select("technician", "Técnico A");
    const currentRequest = store.select("technician", "Técnico B");
    store.resolve(oldRequest, emptyResult);
    expect(store.getState().requestId).toBe(currentRequest);
    store.dispose();
    store.resolve(currentRequest, emptyResult);
    expect(store.getState().status).toBe("disposed");
  });
});
