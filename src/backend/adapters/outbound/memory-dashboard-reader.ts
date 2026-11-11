import { createDashboardSnapshot } from "../../domain/dashboard";
import type { DashboardReader } from "../../ports/dashboard-reader";

const syntheticSnapshot = createDashboardSnapshot([
  { id: "inspections", label: "Inspecciones", value: "128", trend: "+12%" },
  { id: "compliance", label: "Cumplimiento", value: "94%", trend: "+4%" },
  { id: "pending", label: "Pendientes", value: "07", trend: "-8%" },
], new Date().toISOString());

export class MemoryDashboardReader implements DashboardReader {
  public async read() {
    return syntheticSnapshot;
  }
}
