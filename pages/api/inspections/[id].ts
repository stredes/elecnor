import type { NextApiRequest, NextApiResponse } from "next";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { inspectionDetailQuery } from "@/backend/composition/inspections";
import type { InspectionDetail } from "@/backend/domain/inspections/detail-contract";

export default async function inspectionDetail(
  request: NextApiRequest,
  response: NextApiResponse<InspectionDetail | BackendErrorBody>,
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" });
  }
  const id = typeof request.query.id === "string" ? request.query.id : "";
  if (!id) return response.status(400).json({ error: "Identificador inválido.", code: "BACKEND_REJECTED" });
  try {
    const detail = await inspectionDetailQuery.execute(id);
    return detail ? response.status(200).json(detail) : response.status(404).json({ error: "Inspección no encontrada.", code: "BACKEND_NOT_FOUND" });
  } catch (error) {
    const mapped = mapBackendError(error);
    return response.status(mapped.status).json(mapped.body);
  }
}
