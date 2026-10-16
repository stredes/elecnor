import { buildInspectionQuery } from "../../domain/inspection-list-query";
import { parseInspectionList } from "../../domain/inspection-list-parser";
import type {
  InspectionListQuery,
  InspectionListResult,
} from "../../domain/inspection-list-contract";
import type { InspectionReader } from "../../ports/inspection-reader";

export class HttpInspectionReader implements InspectionReader {
  public constructor(
    private readonly endpoint: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  public async list(query: InspectionListQuery): Promise<InspectionListResult> {
    const endpoint = this.endpoint.replace(/\/$/, "");
    const response = await this.fetcher(`${endpoint}/api/inspections?${buildInspectionQuery(query)}`);
    if (!response.ok) throw new Error(`Inspection backend responded ${response.status}`);
    return parseInspectionList(await response.json());
  }
}
