import { describe, expect, it } from "vitest";
import { calculateWorkContextPeople } from "@/backend/domain/reporting/calculate-work-context-people";

describe("calculateWorkContextPeople", () => {
  it("counts unique technicians independently for height and floor contexts", () => {
    expect(calculateWorkContextPeople([
      { technician: " Ana Pérez ", percentage: 0.8, actions: 0, workContext: "ALTURA" },
      { technician: "ana pérez", percentage: 0.7, actions: 1, workContext: "ALTURA" },
      { technician: "Luis Soto", percentage: 0.9, actions: 0, workContext: "PISO" },
      { technician: "luis soto", percentage: 0.9, actions: 0, workContext: "ALTURA" },
      { technician: null, percentage: 0.9, actions: 0, workContext: "PISO" },
      { technician: "Sin contexto", percentage: 0.9, actions: 0, workContext: "SIN_CLASIFICAR" },
    ])).toEqual({ altura: 2, piso: 1 });
  });
});
