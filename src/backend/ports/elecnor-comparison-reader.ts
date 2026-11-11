import type { ElecnorComparisonQuery, ElecnorComparisonResult, ElecnorWorker } from "../domain/elecnor-contract";
export interface ElecnorComparisonReader { list(query: ElecnorComparisonQuery): Promise<ElecnorComparisonResult>; update(workerId: string, reviewed: boolean, note: string | null): Promise<ElecnorWorker>; }
