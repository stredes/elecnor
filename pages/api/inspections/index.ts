import type { NextApiRequest, NextApiResponse } from "next";
import { inspectionQuery } from "@/backend/composition/inspections";
import { parseInspectionQuery } from "@/backend/domain/inspection-list-query";
import type { InspectionListResult } from "@/backend/domain/inspection-list-contract";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";

export default async function inspections(
  request: NextApiRequest,
  response: NextApiResponse<InspectionListResult | BackendErrorBody>,
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" });
  }
  try {
    return response.status(200).json(await inspectionQuery.execute(parseInspectionQuery(request.query)));
  } catch (error) {
    const mapped = mapBackendError(error);
    return response.status(mapped.status).json(mapped.body);
  }
}
