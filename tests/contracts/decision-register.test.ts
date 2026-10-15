import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const decisionIds = ["D-02", "D-03", "D-05", "D-06", "D-10"];
const expectedFailure =
  "Pendiente de owners y evidencia humana; no fabricar aprobación.";

function readMatrix(): string {
  return readFileSync("docs/np-0028-decision-matrix.md", "utf8");
}

function sectionFor(matrix: string, id: string): string {
  const start = matrix.indexOf(`## ${id}`);
  const end = matrix.indexOf("\n## ", start + 1);
  return matrix.slice(start, end < 0 ? matrix.length : end);
}

describe("NP-0028/AC-03/TEST-03 decision register", () => {
  it("requires owner and evidence for every pending decision", () => {
    const sections = decisionIds.map((id) => sectionFor(readMatrix(), id));
    const complete = sections.every(
      (section) =>
        section &&
        !section.includes("Owner: no asignado") &&
        section.includes("Aprobación externa:"),
    );
    if (!complete) throw new Error(expectedFailure);
  });

  it("keeps the canonical DoR closed until decisions are approved", () => {
    const story = JSON.parse(
      readFileSync(".hc/stories/NP-0028.json", "utf8"),
    );
    expect(story.story.definition_of_ready.ready).toBe(false);
  });
});
