import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { useMetricSelection } from "@/dashboard/hooks/use-metric-selection";

const root = process.cwd();
const read = (path: string) => readFileSync(`${root}/${path}`, "utf8");

describe("NP-0041/AC-03/TEST-03 frontend data-flow boundaries", () => {
  it("exposes a hook without transport or business-rule dependencies", () => {
    expect(typeof useMetricSelection).toBe("function");
    const hook = read("src/dashboard/hooks/use-metric-selection.ts");

    expect(hook).toMatch(/useSyncExternalStore/);
    expect(hook).not.toMatch(/next\/|fetch\(|calculate|zustand/);
  });

  it("keeps pages and views free of metric calculations and direct transport", () => {
    const files = [
      "pages/metricas/index.tsx",
      "src/dashboard/views/DashboardView.tsx",
      "src/dashboard/views/MetricsView.tsx",
    ];

    for (const file of files) {
      expect(read(file)).not.toMatch(/fetch\(|calculateKpis|calculatePercentiles|sqlite|zustand/);
    }
  });
});
