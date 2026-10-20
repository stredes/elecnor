import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const decisionIds = ["D-02", "D-03", "D-05", "D-06", "D-10"];
function readMatrix(): string {
  return readFileSync("docs/np-0028-decision-matrix.md", "utf8");
}

function sectionFor(matrix: string, id: string): string {
  const start = matrix.indexOf(`## ${id}`);
  const end = matrix.indexOf("\n## ", start + 1);
  return matrix.slice(start, end < 0 ? matrix.length : end);
}

describe("NP-0028 administrative decision register history", () => {
  it("retains an external approval marker for every decision", () => {
    const sections = decisionIds.map((id) => sectionFor(readMatrix(), id));
    expect(sections.every((section) => section.includes("Aprobación externa:"))).toBe(true);
  });

  it("keeps the canonical readiness field explicit", () => {
    const readiness = readFileSync("docs/np-0028-test-01.md", "utf8");
    expect(readiness).toMatch(/DoR global permanece `ready=(?:true|false)`/u);
  });
});
