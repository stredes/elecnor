import { describe, expect, it } from "vitest";
import { HttpCExtractReader } from "@/backend/adapters/outbound/http-c-extract-reader";
import { validCExtractDocument } from "../contracts/c-extract-fixtures";

describe("NP-0031/AC-01/TEST-01 C-EXTRACT HTTP boundary", () => {
  it("uploads a transient PDF and validates the versioned facts response", async () => {
    let request: RequestInit | undefined;
    const fetcher = async (_input: RequestInfo | URL, init?: RequestInit) => {
      request = init;
      return response(validCExtractDocument);
    };
    const reader = new HttpCExtractReader("http://fastapi.test", fetcher);

    const result = await reader.extract({
      name: "synthetic.pdf",
      content: new Uint8Array([37, 80, 68, 70]),
    });

    expect(request?.method).toBe("POST");
    expect(request?.body).toBeInstanceOf(FormData);
    expect(new Headers(request?.headers).get("X-Fasapi-Contract-Version")).toBe("c-legacy-inspections/1.0.0");
    const file = (request?.body as FormData).get("file") as File;
    expect(file.name).toBe("synthetic.pdf");
    expect(file.type).toBe("application/pdf");
    expect(result.sections[0].items[0].source_text).toBe("EPP sintético");
    expect(result.date?.month).toBe(3);
  });

  it("adapts the current np0028-fasapi Spanish response to C-EXTRACT", async () => {
    const reader = new HttpCExtractReader("http://fastapi.test", async () => response({
      auditoria: {
        titulo: "Auditoría", estado: "PARCIAL", auditor: null, tecnico: null,
        fecha: null, fecha_parcial: "03/2026", hora: null, zona_horaria: null,
        direccion_cliente: "Talca", puntuacion: { obtenida: 7, maxima: 10, porcentaje: 0.7 },
        elementos_senalados: null, acciones: null,
      },
      secciones: [{ nombre: "EPP", preguntas: [{ numero: 1, pregunta: "Casco", respuesta: null, observacion: null, pagina: 2 }] }],
      resumen_elementos_senalados: [], observaciones_generales: [], advertencias: [],
    }));

    const result = await reader.extract({ name: "audit.pdf", content: new Uint8Array([1, 2, 3]) });
    expect(result.extraction_status).toBe("partial");
    expect(result.partial_date).toBe("03/2026");
    expect(result.location?.address).toBe("Talca");
    expect(result.source?.sha256).toMatch(/^[a-f0-9]{64}$/u);
    expect(result.score?.percentage_scale).toBe("fraction");
  });

  it("does not expose upstream response content on a rejected request", async () => {
    const fetcher = async () => response({ detail: "synthetic sensitive body" }, 422);
    const reader = new HttpCExtractReader("http://fastapi.test", fetcher);

    await expect(reader.extract({ name: "synthetic.pdf", content: new Uint8Array([1]) }))
      .rejects.toMatchObject({ code: "UPSTREAM_REJECTED" });
  });
});

function response(body: unknown, status = 200): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
}
