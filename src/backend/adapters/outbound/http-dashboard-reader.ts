import { parseDashboardSnapshot } from "../../domain/dashboard";
import type { DashboardReader } from "../../ports/dashboard-reader";

export class HttpDashboardReader implements DashboardReader {
  public constructor(
    private readonly endpoint: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  public async read() {
    const response = await this.fetcher(`${this.endpoint}/dashboard`);
    if (!response.ok) throw new Error(`Backend responded ${response.status}`);
    return parseDashboardSnapshot(await response.json());
  }
}
