import { guardInspectionMutation } from "../../domain/inspections/mutation-boundaries";
import type { MutationDecision } from "../../domain/inspections/mutation-boundaries";
import type { WriteInspectionMetadata } from "../../ports/write-inspection-metadata";

export class UpdateInspectionMetadata {
  public constructor(private readonly writer: WriteInspectionMetadata) {}

  public async execute(id: unknown, payload: unknown): Promise<MutationDecision> {
    const decision = guardInspectionMutation(id, payload);
    if (!decision.ok) return decision;
    await this.writer.update(decision.id, decision.update);
    return decision;
  }
}
