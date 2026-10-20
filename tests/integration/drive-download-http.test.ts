import { PassThrough } from "node:stream";
import { describe, expect, it } from "vitest";
import { streamPdf } from "@/backend/adapters/inbound/download-response";
import { HttpDocumentDownloadReader } from "@/backend/adapters/outbound/http-document-download-reader";

describe("Drive download BFF adapters", () => {
  it("streams only PDF content, sanitizes Content-Disposition and refuses redirects", async () => {
    const reader = new HttpDocumentDownloadReader("https://fasapi.test", async (_url, init) => {
      expect(init?.redirect).toBe("manual");
      return new Response(new Uint8Array([37, 80, 68, 70]), { headers: { "content-type": "application/pdf", "content-disposition": "attachment; filename=\"informe.pdf\"", location: "https://drive.google.com/private" } });
    }, { inspectionDownload: "/api/v1/inspections/{id}/download", documentDownload: "/api/v1/documents/{id}/download" });
    const file = await reader.download("inspection", "INS-1");
    expect(file.filename).toBe("informe.pdf");
    expect((await new Response(file.body).arrayBuffer()).byteLength).toBe(4);

    const response = new PassThrough() as PassThrough & { setHeader: (name: string, value: string) => void };
    const responseHeaders = new Map<string, string>();
    response.setHeader = (name, value) => responseHeaders.set(name.toLowerCase(), value);
    const streaming = streamPdf(response as never, { body: new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array([1])); controller.close(); } }), filename: "informe final.pdf", contentType: "application/pdf", contentLength: null });
    await streaming;
    expect(responseHeaders.get("content-disposition")).toContain("attachment");
    expect(responseHeaders.has("location")).toBe(false);

    const redirect = new HttpDocumentDownloadReader("https://fasapi.test", async () => new Response(null, { status: 302, headers: { location: "https://drive.google.com/private" } }), { inspectionDownload: "/i/{id}", documentDownload: "/d/{id}" });
    await expect(redirect.download("document", "DOC-1")).rejects.toMatchObject({ code: "REJECTED", status: 302 });
  });

  it("blocks document-id download until FastAPI publishes that route", async () => {
    const reader = new HttpDocumentDownloadReader("https://fasapi.test", async () => { throw new Error("must not call unavailable document route"); }, { inspectionDownload: "/i/{id}", documentDownload: "/d/{id}" }, {}, false);
    await expect(reader.download("document", "DOC-1")).rejects.toMatchObject({ code: "FAILED_DEPENDENCY", status: 424 });
  });
});
