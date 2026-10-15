import type { DashboardSnapshot } from "../domain/dashboard";

export interface DashboardReader {
  read(): Promise<DashboardSnapshot>;
}
