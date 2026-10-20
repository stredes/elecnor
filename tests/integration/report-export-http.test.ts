import { describe, expect, it } from "vitest";
import { HttpReportExportReader } from "@/backend/adapters/outbound/http-report-export-reader";

describe("report export HTTP adapter", () => {
  it("requests the official XLSX and sanitizes the download name", async () => {
    let requested = "";
    let headers: Headers | undefined;
    const reader = new HttpReportExportReader("https://fasapi.test", async (input, init) => {
      requested = String(input);
      headers = new Headers(init?.headers);
      return new Response(new Uint8Array([80, 75]), { headers: {
        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "content-disposition": "attachment; filename*=UTF-8''informe%20final.xlsx",
        "X-Fasapi-Scope": "official",
      } });
    }, "/api/v1/export/excel", { contractVersion: "c-legacy-inspections/1.0.0", internalToken: "secret" });

    const file = await reader.download();
    expect(requested).toBe("https://fasapi.test/api/v1/export/excel?scope=official");
    expect(headers?.get("X-Fasapi-Internal-Token")).toBe("secret");
    expect(headers?.get("X-Fasapi-Scope")).toBe("official");
    expect(file.filename).toBe("informe final.xlsx");
    expect((await new Response(file.body).arrayBuffer()).byteLength).toBe(2);
  });

  it("rejects an unexpected content type", async () => {
    const reader = new HttpReportExportReader("https://fasapi.test", async () => new Response("not xlsx", { headers: { "content-type": "text/plain", "X-Fasapi-Scope": "official" } }));
    await expect(reader.download()).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });
});
