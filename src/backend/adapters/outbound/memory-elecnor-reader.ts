import type { ElecnorComparisonQuery, ElecnorComparisonResult, ElecnorWorker } from "../../domain/elecnor-contract";
import type { ElecnorComparisonReader } from "../../ports/elecnor-comparison-reader";

const SYNTHETIC_WORKER: ElecnorWorker = {
  worker_id: "ELECNOR-SYNTH-1", rut: "11.111.111-1", name: "NORTE, CLARA",
  name_detected: null, commune: "Santiago", supervisor: "Supervisor sintético", reviewed: false,
  review_note: null, status: "SIN_INSPECCION", inspection_count: 0, inspections: [],
};

export class MemoryElecnorComparisonReader implements ElecnorComparisonReader {
  private worker: ElecnorWorker = SYNTHETIC_WORKER;

  public async list(query: ElecnorComparisonQuery): Promise<ElecnorComparisonResult> {
    const rows = this.filtered(query);
    return { data: rows.slice(query.offset, query.offset + query.limit), total: rows.length,
      limit: query.limit, offset: query.offset, metrics: metrics(rows) };
  }

  public async update(workerId: string, reviewed: boolean, note: string | null): Promise<ElecnorWorker> {
    if (this.worker.worker_id !== workerId) throw new Error("Trabajador no encontrado");
    this.worker = { ...this.worker, reviewed, review_note: note?.trim() || null };
    return this.worker;
  }

  private filtered(query: ElecnorComparisonQuery): ElecnorWorker[] {
    const normalized = normalize(query.q);
    const matchesQuery = !normalized || [this.worker.name, this.worker.rut, this.worker.name_detected]
      .some(value => normalize(value).includes(normalized));
    const matchesStatus = query.status === "all" || query.status === "without_inspection" ||
      (query.status === "pending_review" && !this.worker.reviewed) ||
      (query.status === "reviewed" && this.worker.reviewed) ||
      (query.status === "with_inspection" && this.worker.inspection_count > 0);
    return matchesQuery && matchesStatus ? [this.worker] : [];
  }
}

function normalize(value: string | null): string {
  return (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function metrics(rows: readonly ElecnorWorker[]) {
  return { total_workers: rows.length, with_inspection: rows.filter(row => row.inspection_count > 0).length,
    without_inspection: rows.filter(row => row.inspection_count === 0).length,
    exact_matches: rows.filter(row => row.status === "INSPECCION_ENCONTRADA").length,
    variant_matches: rows.filter(row => row.status === "REVISAR_VARIANTE").length,
    reviewed: rows.filter(row => row.reviewed).length,
    pending_review: rows.filter(row => !row.reviewed).length };
}
