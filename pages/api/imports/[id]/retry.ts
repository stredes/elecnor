import type { NextApiRequest, NextApiResponse } from "next";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { parseResourceId, ResourceIdError } from "@/backend/adapters/inbound/resource-id";
import { driveImportGateway } from "@/backend/composition/import-operations";
import type { DriveSyncStatus } from "@/backend/domain/import-operation-contract";

export default async function importRetry(
  request: NextApiRequest,
  response: NextApiResponse<DriveSyncStatus | BackendErrorBody>,
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" });
  }
  try {
    return response.status(200).json(await driveImportGateway.retry(parseResourceId(request.query.id)));
  } catch (error) {
    if (error instanceof ResourceIdError) return response.status(400).json({ error: error.message, code: "BACKEND_REJECTED" });
    const mapped = mapBackendError(error);
    return response.status(mapped.status).json(mapped.body);
  }
}
