import type { ReportingInspectionFact } from "./reporting-facts-contract";

export type WorkContextPeople = {
  readonly altura: number;
  readonly piso: number;
};

export function calculateWorkContextPeople(inspections: readonly ReportingInspectionFact[]): WorkContextPeople {
  const people = { altura: new Set<string>(), piso: new Set<string>() };
  for (const inspection of inspections) {
    const technician = normalizeTechnician(inspection.technician);
    if (!technician) continue;
    if (inspection.workContext === "ALTURA") people.altura.add(technician);
    if (inspection.workContext === "PISO") people.piso.add(technician);
  }
  return { altura: people.altura.size, piso: people.piso.size };
}

function normalizeTechnician(value: string | null): string {
  return value?.trim().toLocaleLowerCase("es-CL") ?? "";
}
