import type { NextApiRequest, NextApiResponse } from "next";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { elecnorComparisonReader } from "@/backend/composition/elecnor-comparison";
import type { ElecnorWorker } from "@/backend/domain/elecnor-contract";
export default async function handler(request: NextApiRequest, response: NextApiResponse<{ data: ElecnorWorker } | BackendErrorBody>) {
  if (request.method !== "PATCH") { response.setHeader("Allow", "PATCH"); return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" }); }
  try { const value = request.body as { reviewed?: unknown; note?: unknown }; if (typeof value?.reviewed !== "boolean") return response.status(400).json({ error: "reviewed es obligatorio.", code: "BACKEND_REJECTED" }); return response.status(200).json({ data: await elecnorComparisonReader.update(String(request.query.workerId), value.reviewed, typeof value.note === "string" ? value.note : null) }); } catch (error) { const mapped = mapBackendError(error); return response.status(mapped.status).json(mapped.body); }
}
