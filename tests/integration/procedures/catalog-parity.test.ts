import { describe, expect, it } from "vitest";
import { GetProcedure } from "@/backend/application/procedures/get-procedure";
import { ListProcedures } from "@/backend/application/procedures/list-procedures";
import { MemoryProcedureReader } from "@/backend/adapters/outbound/memory-procedure-reader";
import type { Procedure } from "@/backend/domain/procedures/procedure-contract";

describe("NP-0038/AC-01/TEST-01 procedure catalog parity", () => {
  it("preserves total, filters and public detail through a replaceable reader", async () => {
    const useCase = new ListProcedures(new MemoryProcedureReader([procedure("p-1", "Altura"), procedure("p-2", "EPP")]));

    await expect(useCase.execute({ q: "altura", area: "" })).resolves.toMatchObject({
      total: 1, data: [{ id: "p-1", title: "Trabajo en altura" }],
    });
    const get = new GetProcedure(new MemoryProcedureReader([procedure("p-1", "Altura"), procedure("p-2", "EPP")]));
    await expect(get.execute("p-2")).resolves.toMatchObject({ id: "p-2", filename: "epp.pdf" });
    await expect(get.execute("missing")).resolves.toBeNull();
  });
});

function procedure(id: string, kind: "Altura" | "EPP"): Procedure {
  return {
    id, title: kind === "Altura" ? "Trabajo en altura" : "Uso de EPP", code: "P-1", area: kind,
    description: "Descripción", youtubeVideoId: null, pdfUrl: "https://files.test/p.pdf",
    filename: kind === "EPP" ? "epp.pdf" : "altura.pdf", createdAt: "2026-01-01", updatedAt: "2026-01-01",
  };
}
