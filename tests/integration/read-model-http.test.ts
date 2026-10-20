import { describe, expect, it } from "vitest";
import { HttpMetricsReader } from "@/backend/adapters/outbound/http-metrics-reader";
import { HttpReportingFactsReader } from "@/backend/adapters/outbound/http-reporting-facts-reader";
import { HttpSupportReaders } from "@/backend/adapters/outbound/http-support-readers";

describe("backend read-model HTTP adapters", () => {
  it("sends the selected scope to reporting facts", async () => {
    let requested = "";
    const reader = new HttpReportingFactsReader("http://backend.test", async (input) => {
      requested = String(input);
      return webResponse({ inspections: [], importLogs: [], metrics: [] }, { "X-Fasapi-Scope": "all" });
    }, undefined, {}, "all");

    await expect(reader.read()).resolves.toEqual({ inspections: [], importLogs: [], metrics: [] });
    expect(requested).toBe("http://backend.test/api/v1/reporting/facts?scope=all");
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

  it("maps snake_case metric records to the frontend contract", async () => {
    const reader = new HttpMetricsReader("http://backend.test", async () => webResponse({
      code: "EPP-1", metric: "EPP", section: "Preparación", observations: 1, applicable: 1,
      conforming: 1, non_conforming: 0, compliance: 100, technicians: [],
      records: [{ inspection_id: "INS-1", technician: null, date: null, observation: null }],
    }));
    await expect(reader.detail("EPP-1")).resolves.toMatchObject({ records: [{ inspectionId: "INS-1" }] });
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
