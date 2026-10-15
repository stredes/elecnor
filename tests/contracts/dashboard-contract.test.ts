import { describe, expect, it } from "vitest";
import { parseDashboardSnapshot } from "@/backend/domain/dashboard";

describe("dashboard contract", () => {
  it("rejects an incomplete backend payload", () => {
    expect(() => parseDashboardSnapshot({ status: "healthy" })).toThrow(
      "Invalid dashboard snapshot",
    );
  });

  it("accepts a compatible backend payload", () => {
    const payload = { status: "healthy", generatedAt: "now", metrics: [] };

    expect(parseDashboardSnapshot(payload)).toEqual(payload);
  });
});
