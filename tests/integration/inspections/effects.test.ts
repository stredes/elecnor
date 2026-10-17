import { describe, expect, it } from "vitest";
import { UpdateInspectionMetadata } from "@/backend/application/inspections/update-inspection-metadata";
import type { InspectionMetadataUpdate } from "@/backend/domain/inspections/update-policy";
import type { WriteInspectionMetadata } from "@/backend/ports/write-inspection-metadata";

describe("NP-0037/AC-02/TEST-02 inspection mutation effects", () => {
  it("does not call the writer for invalid input and delegates valid metadata", async () => {
    const writer = new SpyWriter();
    const useCase = new UpdateInspectionMetadata(writer);

    await expect(useCase.execute("inspection-1", { score: 10 })).resolves.toMatchObject({ ok: false });
    await expect(useCase.execute("inspection-1", { technician: "Técnico B" })).resolves.toMatchObject({ ok: true });
    expect(writer.calls).toHaveLength(1);
    expect(writer.calls[0]?.update.status).toBe("PARCIAL");
  });
});

class SpyWriter implements WriteInspectionMetadata {
  public readonly calls: { id: string; update: InspectionMetadataUpdate }[] = [];

  public async update(id: string, update: InspectionMetadataUpdate): Promise<void> {
    this.calls.push({ id, update });
  }
}
