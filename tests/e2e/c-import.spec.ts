import { expect, test } from "@playwright/test";

test.describe("NP-0028/AC-02/TEST-08 C-IMPORT HTTP contract", () => {
  test("rejects an empty multipart selection", async ({ request }) => {
    const response = await request.post("/api/import", {
      multipart: { note: "synthetic fixture" },
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: "Selecciona al menos un PDF." });
  });

  test("keeps valid import unavailable without forwarding", async ({ request }) => {
    const response = await request.post("/api/import", {
      multipart: {
        files: {
          name: "synthetic.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("%PDF-1.4 synthetic"),
        },
      },
    });

    expect(response.status()).toBe(503);
    expect(await response.json()).toEqual({
      error: "El servicio de importación no está disponible.",
    });
  });
});
