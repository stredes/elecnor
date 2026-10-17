import { ListProcedures } from "../application/procedures/list-procedures";
import { HttpProcedureReader } from "../adapters/outbound/http-procedure-reader";
import { MemoryProcedureReader } from "../adapters/outbound/memory-procedure-reader";
import type { Procedure } from "../domain/procedures/procedure-contract";
import type { ReadProcedures } from "../ports/procedures/read-procedures";

const syntheticProcedures: readonly Procedure[] = [{
  id: "synthetic-procedure-1", title: "Trabajo en altura", code: "P-1", area: "Altura",
  description: "Procedimiento sintético para pruebas", youtubeVideoId: null,
  pdfUrl: "https://files.test/synthetic-altura.pdf", filename: "synthetic-altura.pdf",
  createdAt: "2026-01-01", updatedAt: "2026-01-01",
}];

export function createProcedureQuery(reader?: ReadProcedures): ListProcedures {
  const selected = reader ?? (process.env.BACKEND_API_URL
    ? new HttpProcedureReader(process.env.BACKEND_API_URL)
    : new MemoryProcedureReader(syntheticProcedures));
  return new ListProcedures(selected);
}

export const procedureQuery = createProcedureQuery();
