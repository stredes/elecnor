import type { NextApiRequest, NextApiResponse } from "next";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { supportReaders } from "@/backend/composition/read-models";
import type { FindingResult } from "@/backend/domain/read-models/finding-contract";

export default async function findings(request: NextApiRequest, response: NextApiResponse<FindingResult | BackendErrorBody>) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" });
  }
  try {
    return response.status(200).json(await supportReaders.findings());
  } catch (error) {
    const mapped = mapBackendError(error);
    return response.status(mapped.status).json(mapped.body);
  }
}
