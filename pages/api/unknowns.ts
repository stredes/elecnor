import type { NextApiRequest, NextApiResponse } from "next";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { supportReaders } from "@/backend/composition/read-models";
import type { UnknownMetricResult } from "@/backend/domain/read-models/unknown-contract";

export default async function unknowns(request: NextApiRequest, response: NextApiResponse<UnknownMetricResult | BackendErrorBody>) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" });
  }
  try {
    return response.status(200).json(await supportReaders.unknowns());
  } catch (error) {
    const mapped = mapBackendError(error);
    return response.status(mapped.status).json(mapped.body);
  }
}
