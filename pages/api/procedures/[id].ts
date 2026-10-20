import type { NextApiRequest, NextApiResponse } from "next";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { procedureReader } from "@/backend/composition/procedures";
import type { ProcedureDetail } from "@/backend/domain/procedures/procedure-contract";

export default async function procedureDetail(
  request: NextApiRequest,
  response: NextApiResponse<ProcedureDetail | BackendErrorBody>,
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" });
  }
  const id = typeof request.query.id === "string" ? request.query.id : "";
  if (!id) return response.status(400).json({ error: "Identificador inválido.", code: "BACKEND_REJECTED" });
  try {
    const detail = await procedureReader.detail(id);
    return detail ? response.status(200).json(detail) : response.status(404).json({ error: "Procedimiento no encontrado.", code: "BACKEND_REJECTED" });
  } catch (error) {
    const mapped = mapBackendError(error);
    return response.status(mapped.status).json(mapped.body);
  }
}
