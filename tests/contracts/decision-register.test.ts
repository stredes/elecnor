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
    const story = JSON.parse(
      readFileSync(".hc/stories/NP-0028.json", "utf8"),
    );
    expect(typeof story.story.definition_of_ready.ready).toBe("boolean");
  });
});
