import type { DashboardSnapshot } from "../domain/dashboard";
import type { DashboardReader } from "../ports/dashboard-reader";

export class GetDashboard {
  public constructor(private readonly reader: DashboardReader) {}

  public execute(): Promise<DashboardSnapshot> {
    return this.reader.read();
  }
}
