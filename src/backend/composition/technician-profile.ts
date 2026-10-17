import { GetTechnicianProfile } from "../application/technicians/get-technician-profile";
import type { ReadInspectionFacts } from "../ports/read-inspection-facts";

export function createTechnicianProfile(
  reader: ReadInspectionFacts, technician: string,
): GetTechnicianProfile {
  return new GetTechnicianProfile(reader, technician);
}
