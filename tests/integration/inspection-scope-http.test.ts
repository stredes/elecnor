import { describe, expect, it } from "vitest";
import { HttpInspectionReader } from "@/backend/adapters/outbound/http-inspection-reader";
import { HttpInspectionDetailReader } from "@/backend/adapters/outbound/http-inspection-detail-reader";
import { inspectionScopeOptions } from "@/backend/composition/inspection-scope";
import { parseInspectionScope } from "@/backend/domain/inspection-scope";
import type { InspectionListQuery } from "@/backend/domain/inspection-list-contract";

const QUERY: InspectionListQuery = {
  filters: { q: "", date: "", from: "", to: "", technician: "", auditor: "", region: "", status: "", score: "", month: "", sort: "date_desc" },
  limit: 25,
  offset: 0,
};

const pending = { contractVersion: "c", internalToken: null, timeoutMs: 2500 };

describe("explicit and traced inspection scope", () => {
  it("defaults to official and only accepts the documented scopes", () => {
    expect(parseInspectionScope(undefined)).toBe("official");
    expect(parseInspectionScope(" ALL ")).toBe("all");
    expect(parseInspectionScope("drop-table")).toBe("official");
  });

  it("requires the FastAPI attestation header while the scope is official", async () => {
    let url = "";
    const reader = new HttpInspectionReader("https://fasapi.test", async (input) => {
      url = String(input);
      return listResponse(url.includes("scope=official") ? { "X-Fasapi-Scope": "official" } : undefined);
    }, "/api/v1/inspections", inspectionScopeOptions(pending, "official"), "official");
    await expect(reader.list(QUERY)).resolves.toMatchObject({ total: 0 });
    expect(url).toContain("scope=official");
  });

  it("fails closed with 424 when official scope is not attested", async () => {
    const reader = new HttpInspectionReader("https://fasapi.test", async () => listResponse(), "/api/v1/inspections", inspectionScopeOptions(pending, "official"), "official");
    await expect(reader.list(QUERY)).rejects.toMatchObject({ code: "FAILED_DEPENDENCY", status: 424 });
  });

  it("sends scope=all without demanding attestation when the operator opts in", async () => {
    let url = "";
    const reader = new HttpInspectionReader("https://fasapi.test", async (input) => {
      url = String(input);
      return listResponse();
    }, "/api/v1/inspections", inspectionScopeOptions(pending, "all"), "all");
    await expect(reader.list(QUERY)).resolves.toMatchObject({ total: 0 });
    expect(url).toContain("scope=all");
  });

  it("carries the scope into the detail request", async () => {
    let url = "";
    const reader = new HttpInspectionDetailReader("https://fasapi.test", async (input) => {
      url = String(input);
      return new Response(JSON.stringify({ inspection: { id: "INS-1", status: "COMPLETA" }, metrics: [] }), { status: 200, headers: { "content-type": "application/json" } });
    }, "/api/v1/inspections", pending, "all");
    await expect(reader.read("INS-1")).resolves.toMatchObject({ inspection: { id: "INS-1" } });
    expect(url).toContain("scope=all");
  });
});

function listResponse(headers?: Record<string, string>): Response {
  return new Response(JSON.stringify({ data: [], total: 0, limit: 25, offset: 0, dates: [], auditors: [], regions: [] }), {
    status: 200,
    headers: { "content-type": "application/json", ...headers },
  });
}
