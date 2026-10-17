import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseInspectionQuery } from "@/backend/domain/inspection-list-query";
import { syntheticInspectionDetail, syntheticInspectionQuery, syntheticTechnicianProfile } from "@/backend/composition/synthetic-inspection-loader";

const root = process.cwd();
const read = (path: string) => readFileSync(`${root}/${path}`, "utf8");

describe("NP-0042/AC-03/TEST-03 inspection presentation boundaries", () => {
  it("loads list, detail and technician data through synthetic composition", async () => {
    const list = await syntheticInspectionQuery.execute(parseInspectionQuery({ sort: "date_asc" }));
    const detail = await syntheticInspectionDetail.execute(list.data[0].id);
    const profile = await syntheticTechnicianProfile("Técnico A").execute();

    expect(list.data[0].id).toBe("synthetic-inspection-1");
    expect(detail?.inspection.id).toBe(list.data[0].id);
    expect(profile.technician).toBe("Técnico A");
  });

  it("keeps Pages as loaders and presentation free of transport and official rules", () => {
    const pages = ["pages/inspecciones/index.tsx", "pages/inspecciones/[id].tsx", "pages/tecnicos/[nombre].tsx"];
    for (const page of pages) {
      const source = read(page);
      expect(source).toMatch(/getServerSideProps/);
      expect(source).not.toMatch(/fetch\(|HttpInspection|sqlite|calculateKpis|calculatePercentiles/);
    }
    const views = ["src/inspections/views/InspectionsView.tsx", "src/inspections/views/InspectionDetailView.tsx", "src/technicians/views/TechnicianView.tsx"];
    for (const view of views) expect(read(view)).not.toMatch(/fetch\(|calculateKpis|calculatePercentiles|permission/);
    expect(read("src/inspections/state/inspection-filter-store.ts")).not.toMatch(/fetch\(|setTimeout\(|zustand/);
  });
});
