import { describe, expect, it } from "vitest";
import { GetDashboard } from "@/backend/application/get-dashboard";
import type { DashboardReader } from "@/backend/ports/dashboard-reader";

describe("GetDashboard", () => {
  it("delegates reading to the output port", async () => {
    const snapshot = { status: "healthy" as const, generatedAt: "now", metrics: [] };
    const reader: DashboardReader = { read: async () => snapshot };

    await expect(new GetDashboard(reader).execute()).resolves.toBe(snapshot);
  });
});
