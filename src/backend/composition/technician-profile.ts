import { GetTechnicianProfile } from "../application/technicians/get-technician-profile";
import { InspectionFactsReader } from "../adapters/outbound/inspection-facts-reader";
import type { ReadInspectionFacts } from "../ports/read-inspection-facts";
import { createInspectionReader } from "./inspections";

export function createTechnicianProfile(
  reader: ReadInspectionFacts, technician: string,
): GetTechnicianProfile {
  return new GetTechnicianProfile(reader, technician);
}

export function createTechnicianProfileQuery(technician: string, fetcher?: typeof fetch): GetTechnicianProfile {
  return createTechnicianProfile(new InspectionFactsReader(createInspectionReader(fetcher), technician), technician);
}
