import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { HttpInspectionReader } from "@/backend/adapters/outbound/http-inspection-reader";
import { parseInspectionQuery } from "@/backend/domain/inspection-list-query";

const root = process.cwd();
const pureFiles = [
  "src/backend/domain/inspection-list-contract.ts",
  "src/backend/domain/inspection-list-query.ts",
  "src/backend/domain/inspection-list-selection.ts",
  "src/backend/application/list-inspections.ts",
  "src/backend/ports/inspection-reader.ts",
];

describe("NP-0030/AC-03/TEST-03 inspection architecture", () => {
  it("calls the backend read API without exposing adapters to the browser", async () => {
    const urls: string[] = [];
    const fetcher = async (input: RequestInfo | URL) => {
      urls.push(String(input));
      return response();
    };
    const reader = new HttpInspectionReader("http://fastapi.test", fetcher);

    await reader.list(parseInspectionQuery({ limit: "25" }));
    expect(urls).toEqual(["http://fastapi.test/api/v1/inspections?scope=official&limit=25&offset=0"]);
  });

  it("keeps pure layers framework-free and routes composed in Pages", () => {
    for (const file of pureFiles) {
      const source = readFileSync(`${root}/${file}`, "utf8");
      expect(source).not.toMatch(/(?:next|react|sqlite|sql|adapters|composition)/i);
    }
    const page = readFileSync(`${root}/pages/inspecciones/index.tsx`, "utf8");
    expect(page).toContain("@/backend/composition/inspections");
    expect(page).toContain("@/dashboard/components/InspectionListScreen");
    expect(page).not.toContain("adapters/outbound");
  });
});

function response(): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({ data: [], total: 0, limit: 25, offset: 0, dates: [], auditors: [], regions: [] }),
  } as Response;
}
