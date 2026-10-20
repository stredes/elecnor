import { guardInspectionPage } from "./guard-inspection-page";
import { MAX_INSPECTION_LIMIT, type InspectionListQuery, type InspectionListResult } from "../../domain/inspection-list-contract";
import type { GuardedInspectionListResult } from "./guard-gating-contract";
import type { InspectionReader } from "../../ports/inspection-reader";

export class ListGuardedInspections {
  public constructor(private readonly reader: InspectionReader) {}

  public async execute(query: InspectionListQuery): Promise<GuardedInspectionListResult> {
    const complete = await readAll(this.reader, query);
    const guard = guardInspectionPage({ list: complete, computedAt: new Date().toISOString() });
    const official = new Set(guard.trays.official);
    const data = complete.data.filter((item) => official.has(item.id));
    return { ...complete, data: data.slice(query.offset, query.offset + query.limit), total: data.length, limit: query.limit, offset: query.offset, guard };
  }
}

async function readAll(reader: InspectionReader, query: InspectionListQuery): Promise<InspectionListResult> {
  const first = await reader.list({ ...query, limit: MAX_INSPECTION_LIMIT, offset: 0 });
  const rows = [...first.data];
  while (rows.length < first.total) {
    const next = await reader.list({ ...query, limit: MAX_INSPECTION_LIMIT, offset: rows.length });
    if (next.data.length === 0) break;
    rows.push(...next.data);
  }
  return { ...first, data: rows, total: rows.length, limit: rows.length, offset: 0 };
}
