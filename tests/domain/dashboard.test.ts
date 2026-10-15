import { describe, expect, it } from "vitest";
import { createDashboardSnapshot } from "@/backend/domain/dashboard";

describe("dashboard domain", () => {
  it("copies metrics and preserves the declared status", () => {
    const metrics = [{ id: "one", label: "Uno", value: "1", trend: "+1%" }];

    const snapshot = createDashboardSnapshot(
      metrics,
      "2026-01-01T00:00:00.000Z",
      "degraded",
    );

    expect(snapshot).toEqual({
      status: "degraded",
      generatedAt: "2026-01-01T00:00:00.000Z",
      metrics,
    });
    expect(snapshot.metrics).not.toBe(metrics);
  });
});
