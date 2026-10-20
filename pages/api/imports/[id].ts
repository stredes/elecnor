import type { NextApiRequest, NextApiResponse } from "next";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { parseResourceId, ResourceIdError } from "@/backend/adapters/inbound/resource-id";
import { driveImportGateway } from "@/backend/composition/import-operations";
import type { DriveSyncStatus } from "@/backend/domain/import-operation-contract";

export default async function importStatus(
  request: NextApiRequest,
  response: NextApiResponse<DriveSyncStatus | BackendErrorBody>,
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" });
  }
  try {
    const id = parseResourceId(request.query.id);
    const run = await driveImportGateway.status(id);
    return run
      ? response.status(200).json(run)
      : response.status(404).json({ error: "Sync no encontrado.", code: "BACKEND_NOT_FOUND" });
  } catch (error) {
    if (error instanceof ResourceIdError) return response.status(400).json({ error: error.message, code: "BACKEND_REJECTED" });
    const mapped = mapBackendError(error);
    return response.status(mapped.status).json(mapped.body);
  }
}
