import {
  DEFAULT_INSPECTION_LIMIT,
  type InspectionListItem,
} from "../../domain/inspection-list-contract";
import { parseInspectionQuery } from "../../domain/inspection-list-query";
import type { ReportingFacts, ReportingInspectionFact } from "../../domain/reporting/reporting-facts-contract";
import type { ReadInspectionFacts } from "../../ports/read-inspection-facts";
import type { InspectionReader } from "../../ports/inspection-reader";

export class InspectionFactsReader implements ReadInspectionFacts {
  public constructor(
    private readonly reader: InspectionReader,
    private readonly technician: string,
  ) {}

  public async read(): Promise<ReportingFacts> {
    const query = parseInspectionQuery({ technician: this.technician, limit: String(DEFAULT_INSPECTION_LIMIT) });
    const result = await this.reader.list(query);
    return { inspections: result.data.map(toFact), importLogs: [], metrics: [] };
  }
}

function toFact(item: InspectionListItem): ReportingInspectionFact {
  return {
    id: item.id,
    date: item.date,
    technician: item.technician,
    auditor: item.auditor,
    address: item.address,
    city: item.city,
    region: item.region,
    filename: item.filename,
    percentage: item.percentage === null ? null : item.percentage / 100,
    actions: item.actions,
  };
}
