import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ListProcedureFamilies } from "@/backend/application/procedures/list-procedure-families";
import { MemoryProcedureReader } from "@/backend/adapters/outbound/memory-procedure-reader";

const root = process.cwd();
const pureFiles = [
  "src/backend/domain/procedures/procedure-contract.ts",
  "src/backend/domain/procedures/select-procedures.ts",
  "src/backend/domain/procedures/group-procedure-families.ts",
  "src/backend/domain/procedures/parse-procedure-response.ts",
  "src/backend/application/procedures/list-procedures.ts",
  "src/backend/application/procedures/list-procedure-families.ts",
  "src/backend/application/procedures/get-procedure.ts",
  "src/backend/ports/procedures/read-procedures.ts",
];

describe("NP-0038/AC-03 procedure architecture", () => {
  it("keeps grouping in application and accepts a synthetic reader", async () => {
    const reader = new MemoryProcedureReader([procedure("P-1", "Altura"), procedure("P-1", "EPP")]);
    await expect(new ListProcedureFamilies(reader).execute({ q: "", area: "" })).resolves.toMatchObject([
      { code: "P-1", title: "Trabajo", total: 2 },
    ]);
  });

  it("keeps pure layers free of runtime, persistence and internal-path concerns", () => {
    for (const file of pureFiles) {
      const source = readFileSync(`${root}/${file}`, "utf8");
      expect(source).not.toMatch(/(?:next|react|fetch|sqlite|sql|flask|adapters|composition|stored_path)/i);
    }
    const composition = readFileSync(`${root}/src/backend/composition/procedures.ts`, "utf8");
    expect(composition).not.toMatch(/(?:sqlite|sql|flask|stored_path)/i);
    expect(readFileSync(`${root}/src/backend/domain/procedures/procedure-contract.ts`, "utf8")).not.toContain("stored_path");
  });
});

function procedure(code: string, area: string) {
  return {
    id: `${code}-${area}`, title: "Trabajo", code, area, description: null, youtubeVideoId: null,
    pdfUrl: "https://files.test/p.pdf", filename: "p.pdf", createdAt: "2026-01-01", updatedAt: "2026-01-01",
  };
}
