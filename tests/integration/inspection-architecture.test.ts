import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { HttpInspectionReader } from "@/backend/adapters/outbound/http-inspection-reader";
import { parseInspectionQuery } from "@/backend/domain/inspection-list-query";
import { CALL_CENTER_INSPECTION_ID } from "@/backend/domain/inspection-exclusions";

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

  it("excludes the call-center record without fetching the complete dataset", async () => {
    const urls: string[] = [];
    const fetcher = async (input: RequestInfo | URL) => {
      urls.push(String(input));
      const body = { data: [inspection(CALL_CENTER_INSPECTION_ID), inspection("INS-1")], total: 2, limit: 25, offset: 0, dates: [], auditors: [], regions: [] };
      return response(body);
    };
    const reader = new HttpInspectionReader("http://fastapi.test", fetcher);

    const result = await reader.list(parseInspectionQuery({ limit: "25" }));

    expect(result.total).toBe(1);
    expect(result.data.map((item) => item.id)).toEqual(["INS-1"]);
    expect(urls).toHaveLength(1);
  });

  it("keeps pure layers framework-free and routes composed in Pages", () => {
    for (const file of pureFiles) {
      const source = readFileSync(`${root}/${file}`, "utf8");
      expect(source).not.toMatch(/(?:next|react|sqlite|sql|adapters|composition)/i);
    }
    const page = readFileSync(`${root}/pages/inspecciones/index.tsx`, "utf8");
    expect(page).toContain("@/backend/composition/inspections");
    expect(page).toContain("@/inspections/views/InspectionsView");
    expect(page).not.toContain("summaryCache");
    expect(page).not.toContain("MAX_INSPECTION_LIMIT");
    expect(page).not.toContain("adapters/outbound");
  });
});

function response(body: unknown = { data: [], total: 0, limit: 25, offset: 0, dates: [], auditors: [], regions: [] }): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as Response;
}

function inspection(id: string) {
  return { id, date: "2026-06-07", time: "09:00", technician: "Técnico", auditor: "Auditor", address: "Calle 1", city: "Santiago", region: "Metropolitana", percentage: 80, score: 8, maxScore: 10, actions: 0, rubric: "RUBRIC", status: "COMPLETA", filename: `${id}.pdf` };
}
