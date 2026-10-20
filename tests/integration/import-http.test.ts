import { describe, expect, it } from "vitest";
import { HttpImportGateway } from "@/backend/adapters/outbound/http-import-gateway";

describe("C-IMPORT HTTP adapter", () => {
  it("forwards PDF bytes and preserves SHA, legacy id and provenance", async () => {
    let body: FormData | undefined;
    let headers: Headers | undefined;
    const gateway = new HttpImportGateway("http://backend.test", async (_input, init) => {
      body = init?.body as FormData;
      headers = new Headers(init?.headers);
      return response({ seleccionados: 1, procesados: 1, duplicados: 0, errores: 0, inspecciones_nuevas: 1, metricas_insertadas: 2, metricas_sin_clasificar: 0 });
    });

    await expect(gateway.execute([{ name: "audit.pdf", size: 3, content: new Uint8Array([1, 2, 3]), legacyId: "L-1", provenance: { source: "legacy" } }])).resolves.toMatchObject({ procesados: 1 });
    expect((body?.get("files") as File).size).toBe(3);
    expect(body?.get("legacy_id")).toBe("L-1");
    expect(body?.get("provenance")).toBe(JSON.stringify({ source: "legacy" }));
    expect(body?.get("sha256")).toMatch(/^[a-f0-9]{64}$/u);
    expect(headers?.get("X-Fasapi-Contract-Version")).toBe("c-legacy-inspections/1.0.0");
  });

  it.each([409, 424, 502, 503])("keeps upstream import status %s for BFF mapping", async (status) => {
    const gateway = new HttpImportGateway("http://backend.test", async () => response({}, status));
    await expect(gateway.execute([{ name: "audit.pdf", size: 1, content: new Uint8Array([1]) }])).rejects.toMatchObject({ status });
  });
});

function response(body: unknown, status = 200): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
}
