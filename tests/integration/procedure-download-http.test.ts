import { describe, expect, it } from "vitest";
import { HttpProcedureDownloadReader } from "@/backend/adapters/outbound/http-procedure-download-reader";

describe("Procedure PDF download adapter", () => {
  it("requests the procedure proxy and accepts only a PDF response", async () => {
    const reader = new HttpProcedureDownloadReader("https://fasapi.test", async (url, init) => {
      expect(url).toBe("https://fasapi.test/api/v1/procedures/01-ATC/download");
      expect(init?.redirect).toBe("manual");
      return new Response(new Uint8Array([37, 80, 68, 70]), { headers: { "content-type": "application/pdf" } });
    });
    const file = await reader.download("01-ATC");
    expect(file.contentType).toBe("application/pdf");
    expect((await new Response(file.body).arrayBuffer()).byteLength).toBe(4);
  });
});
