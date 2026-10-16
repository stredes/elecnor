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
    const file = (request?.body as FormData).get("file") as File;
    expect(file.name).toBe("synthetic.pdf");
    expect(file.type).toBe("application/pdf");
    expect(result.sections[0].items[0].source_text).toBe("EPP sintético");
    expect(result.date?.month).toBe(3);
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
