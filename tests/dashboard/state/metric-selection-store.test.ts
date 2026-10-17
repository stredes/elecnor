import { describe, expect, it } from "vitest";
import { createMetricSelectionStore } from "@/dashboard/state/metric-selection-store";

const metric = { code: "PREP_EPP", label: "Check list EPP" };

describe("NP-0041/AC-02/TEST-02 metric selection store", () => {
  it("ignores an old response after a newer selection starts", () => {
    const store = createMetricSelectionStore();
    const oldRequest = store.begin("OLD");
    const currentRequest = store.begin(metric.code);

    store.resolve(oldRequest, { code: "OLD", label: "Métrica vieja" });
    expect(store.getState()).toMatchObject({ status: "loading", selectedCode: metric.code });

    store.resolve(currentRequest, metric);
    expect(store.getState()).toMatchObject({ status: "ready", selectedCode: metric.code, selection: metric });
  });

  it("keeps empty and error transitions explicit and isolated", () => {
    const first = createMetricSelectionStore();
    const second = createMetricSelectionStore();
    const firstRequest = first.begin("EMPTY");
    const secondRequest = second.begin("ERROR");

    first.resolve(firstRequest, null);
    second.reject(secondRequest, "No disponible");

    expect(first.getState()).toMatchObject({ status: "empty", selectedCode: "EMPTY" });
    expect(second.getState()).toMatchObject({ status: "error", selectedCode: "ERROR", error: "No disponible" });
  });
});
