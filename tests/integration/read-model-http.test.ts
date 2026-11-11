import { describe, expect, it } from "vitest";
import { HttpMetricsReader } from "@/backend/adapters/outbound/http-metrics-reader";
import { HttpInspectionReader } from "@/backend/adapters/outbound/http-inspection-reader";
import { HttpReportingFactsReader } from "@/backend/adapters/outbound/http-reporting-facts-reader";
import { parseInspectionQuery } from "@/backend/domain/inspection-list-query";
import { HttpSupportReaders } from "@/backend/adapters/outbound/http-support-readers";

describe("backend read-model HTTP adapters", () => {
  it("filters work context locally when the upstream ignores the filter", async () => {
    const reader = new HttpInspectionReader("http://backend.test", async () => webResponse({
      data: [inspection("floor", "PISO"), inspection("height", "ALTURA")],
      total: 2, limit: 1000, offset: 0, dates: [], auditors: [], regions: [],
    }), undefined, {}, "all");

    const result = await reader.list(parseInspectionQuery({ work_context: "ALTURA", limit: "25" }));

    expect(result.data.map((item) => item.id)).toEqual(["height"]);
    expect(result.total).toBe(1);
  });

  it("sends the selected scope to reporting facts", async () => {
    let requested = "";
    const reader = new HttpReportingFactsReader("http://backend.test", async (input) => {
      requested = String(input);
      return webResponse({ inspections: [], importLogs: [], metrics: [] }, { "X-Fasapi-Scope": "all" });
    }, undefined, {}, "all");

    await expect(reader.read()).resolves.toEqual({ inspections: [], importLogs: [], metrics: [] });
    expect(requested).toBe("http://backend.test/api/v1/reporting/facts?scope=all");
  });

  it("removes the excluded call-center facts from reporting", async () => {
    const reader = new HttpReportingFactsReader("http://backend.test", async () => webResponse({
      inspections: [
        { id: "AUD-4A4789008B95", technician: null, percentage: 0, actions: 0 },
        { id: "INS-1", technician: "Técnico", percentage: 0.8, actions: 0 },
      ],
      importLogs: [{ id: "LOG-D24D380977C4" }, { id: "LOG-1" }],
      metrics: [
        { state: "NO_CONFORME", inspectionId: "AUD-4A4789008B95" },
        { state: "CONFORME", inspectionId: "INS-1" },
      ],
    }, { "X-Fasapi-Scope": "all" }), undefined, {}, "all");

    await expect(reader.read()).resolves.toEqual({
      inspections: [{ id: "INS-1", date: null, reportingPeriod: null, technician: "Técnico", auditor: null, address: null, city: null, region: null, filename: null, percentage: 0.8, actions: 0 }],
      importLogs: [{ id: "LOG-1" }],
      metrics: [{ state: "CONFORME", inspectionId: "INS-1", code: null, section: null, metric: null, applicable: null, conforming: null, technician: null, observation: null, date: null, notApplicable: null }],
    });
  });

  it("maps snake_case metric fields and sends the common contract header", async () => {
    let requested = "";
    let headers: Headers | undefined;
    const reader = new HttpMetricsReader("http://backend.test", async (input, init) => {
      requested = String(input);
      headers = new Headers(init?.headers);
      return response({ count: 1, data: [{ metric: "EPP", code: "EPP-1", section: "Preparación", observations: 2, applicable: 2, conforming: 1, non_conforming: 1, compliance: 50 }] });
    });

    await expect(reader.list("weak")).resolves.toMatchObject({ data: [{ nonConforming: 1 }] });
    expect(requested).toBe("http://backend.test/api/v1/metrics?scope=official&band=weak");
    expect(headers?.get("X-Fasapi-Contract-Version")).toBe("c-legacy-inspections/1.0.0");
    expect(headers?.get("X-Fasapi-Contract")).toBe("c-legacy-inspections/1.0.0");
    expect(headers?.get("X-Fasapi-Scope")).toBe("official");
  });

  it("supports the configured all-records metric scope", async () => {
    let requested = "";
    const reader = new HttpMetricsReader("http://backend.test", async (input) => {
      requested = String(input);
      return webResponse({ count: 0, data: [] }, { "X-Fasapi-Scope": "all" });
    }, undefined, { requiredScope: undefined }, "all");

    await expect(reader.list()).resolves.toMatchObject({ data: [] });
    expect(requested).toBe("http://backend.test/api/v1/metrics?scope=all");
  });

  it("maps snake_case metric records to the frontend contract", async () => {
    const reader = new HttpMetricsReader("http://backend.test", async () => webResponse({
      code: "EPP-1", metric: "EPP", section: "Preparación", observations: 1, applicable: 1,
      conforming: 1, non_conforming: 0, compliance: 100, technicians: [],
      records: [{ inspection_id: "INS-1", technician: null, date: null, observation: null }],
    }));
    await expect(reader.detail("EPP-1")).resolves.toMatchObject({ records: [{ inspectionId: "INS-1" }] });
  });
  it("accepts the legacy camelCase inspection identifier from metric details", async () => {
    const reader = new HttpMetricsReader("http://backend.test", async () => webResponse({
      code: "EPP-1", metric: "EPP", section: "Preparación", observations: 1, applicable: 1,
      conforming: 1, non_conforming: 0, compliance: 100, technicians: [],
      records: [{ inspectionId: "INS-LEGACY", technician: null, date: null, observation: null }],
    }));
    await expect(reader.detail("EPP-1")).resolves.toMatchObject({ records: [{ inspectionId: "INS-LEGACY" }] });
  });
  it("fails closed when FastAPI does not attest that official scope was applied", async () => {
    const reader = new HttpMetricsReader("http://backend.test", async () => webResponse({ count: 0, data: [] }), undefined, { requiredScope: "official" });
    await expect(reader.list()).rejects.toMatchObject({ code: "FAILED_DEPENDENCY", status: 424 });
  });

  it("accepts the explicit official-scope attestation", async () => {
    const reader = new HttpMetricsReader("http://backend.test", async () => webResponse({ count: 0, data: [] }, { "X-Fasapi-Scope": "official" }), undefined, { requiredScope: "official" });
    await expect(reader.list()).resolves.toMatchObject({ data: [] });
  });

  it("sends the official scope header to support read models", async () => {
    const requests: string[] = [];
    const scopes: string[] = [];
    const readers = new HttpSupportReaders("http://backend.test", async (input, init) => {
      requests.push(String(input));
      scopes.push(new Headers(init?.headers).get("X-Fasapi-Scope") ?? "");
      return webResponse({ count: 0, data: [] });
    }, { unknowns: "/api/v1/unknown-metrics", findings: "/api/v1/findings", logs: "/api/v1/logs" }, {});

    await readers.unknowns();
    await readers.findings();
    await readers.logs();

    expect(requests).toEqual([
      "http://backend.test/api/v1/unknown-metrics?scope=official",
      "http://backend.test/api/v1/findings?scope=official",
      "http://backend.test/api/v1/logs?scope=official",
    ]);
    expect(scopes).toEqual(["official", "official", "official"]);
  });
});

function response(body: unknown): Response {
  return { ok: true, status: 200, json: async () => body } as Response;
}

function webResponse(body: unknown, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json", ...headers } });
}

function inspection(id: string, workContext: "ALTURA" | "PISO") {
  return { id, date: "2026-01-01", time: null, technician: id, auditor: null, address: null, city: null, region: null, percentage: 0.8, score: 8, maxScore: 10, actions: 0, rubric: null, status: "COMPLETA", filename: null, work_context: workContext };
}
