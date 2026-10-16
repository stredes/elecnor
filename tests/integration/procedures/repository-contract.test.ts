import { describe, expect, it } from "vitest";
import { GetProcedure } from "@/backend/application/procedures/get-procedure";
import { ListProcedures } from "@/backend/application/procedures/list-procedures";
import { HttpProcedureReader } from "@/backend/adapters/outbound/http-procedure-reader";
import { MemoryProcedureReader } from "@/backend/adapters/outbound/memory-procedure-reader";
import type { Procedure } from "@/backend/domain/procedures/procedure-contract";
import type { ReadProcedures } from "@/backend/ports/procedures/read-procedures";

describe("NP-0038/AC-03/TEST-03 procedure repository contract", () => {
  it("supports memory and Gateway readers through the same port", async () => {
    const urls: string[] = [];
    const readers: ReadProcedures[] = [
      new MemoryProcedureReader([procedure()]),
      new HttpProcedureReader("https://gateway.test", async (input) => {
        urls.push(String(input));
        return response(String(input).includes("/procedures/procedure-1") ? apiProcedure() : { total: 1, data: [apiProcedure()] });
      }),
    ];

    for (const reader of readers) {
      await expect(new ListProcedures(reader).execute({ q: "altura", area: "" })).resolves.toMatchObject({
        total: 1, data: [{ id: "procedure-1", title: "Trabajo en altura" }],
      });
      await expect(new GetProcedure(reader).execute("procedure-1")).resolves.toMatchObject({ filename: "altura.pdf" });
    }

    expect(urls).toEqual([
      "https://gateway.test/api/procedures?q=altura&area=",
      "https://gateway.test/api/procedures/procedure-1",
    ]);
  });
});

function procedure(): Procedure {
  return {
    id: "procedure-1", title: "Trabajo en altura", code: "P-1", area: "Altura", description: "Sintética",
    youtubeVideoId: null, pdfUrl: "https://files.test/altura.pdf", filename: "altura.pdf",
    createdAt: "2026-01-01", updatedAt: "2026-01-01",
  };
}

function apiProcedure() {
  return {
    id: "procedure-1", title: "Trabajo en altura", code: "P-1", area: "Altura", description: "Sintética",
    youtube_video_id: null, pdf_url: "https://files.test/altura.pdf", filename: "altura.pdf",
    created_at: "2026-01-01", updated_at: "2026-01-01", stored_path: "/internal/not-public.pdf",
  };
}

function response(body: unknown): Response {
  return { ok: true, status: 200, json: async () => body } as Response;
}
