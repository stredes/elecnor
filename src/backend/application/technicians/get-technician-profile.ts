import { calculateTechnicianProfile } from "../../domain/technicians/calculate-profile";
import type { TechnicianProfile } from "../../domain/technicians/profile-contract";
import type { ReadInspectionFacts } from "../../ports/read-inspection-facts";

export class GetTechnicianProfile {
  public constructor(
    private readonly reader: ReadInspectionFacts,
    private readonly technician: string,
  ) {}

  public async execute(): Promise<TechnicianProfile> {
    const facts = await this.reader.read();
    return calculateTechnicianProfile(facts.inspections, this.technician);
  }
}
