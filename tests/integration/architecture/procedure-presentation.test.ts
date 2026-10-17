import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { syntheticProcedureCatalog, syntheticProcedureDetail } from "@/backend/composition/synthetic-procedure-entrypoint";

const root = process.cwd();
const read = (path: string) => readFileSync(`${root}/${path}`, "utf8");

describe("NP-0043/AC-03/TEST-03 procedure presentation boundaries", () => {
  it("loads filtered catalog and detail through synthetic composition", async () => {
    const catalog = await syntheticProcedureCatalog.execute({ q: "altura", area: "ATC" });
    const detail = await syntheticProcedureDetail.execute("05-ATC");

    expect(catalog.total).toBe(1);
    expect(catalog.families[0].procedures[0].id).toBe("05-ATC");
    expect(detail?.procedure.id).toBe("05-ATC");
  });

  it("keeps Pages as loaders and components free of transport and business rules", () => {
    for (const page of ["pages/procedimientos/index.tsx", "pages/procedimientos/[id].tsx"]) {
      const source = read(page);
      expect(source).toMatch(/getServerSideProps/);
      expect(source).not.toMatch(/fetch\(|HttpProcedure|sqlite|Blob|localStorage/);
    }
    for (const view of ["src/procedures/views/ProceduresView.tsx", "src/procedures/views/ProcedureDetailView.tsx", "src/procedures/components/ProcedureFamilyAccordion.tsx"]) {
      expect(read(view)).not.toMatch(/fetch\(|\/api\/|groupProceduresByFamily|youtubeEmbedUrl/);
    }
    expect(read("src/procedures/state/procedure-create-store.ts")).not.toMatch(/File|Blob|localStorage|sessionStorage/);
  });
});
