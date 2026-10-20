import type { NextApiRequest, NextApiResponse } from "next";
import { parseDriveSyncRequest, DriveSyncRequestError } from "@/backend/adapters/inbound/drive-sync-request";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { driveImportGateway } from "@/backend/composition/import-operations";
import type { DriveSyncSummary } from "@/backend/domain/import-operation-contract";

export default async function driveSync(
  request: NextApiRequest,
  response: NextApiResponse<DriveSyncSummary | BackendErrorBody>,
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" });
  }
  try {
    const result = await driveImportGateway.sync(parseDriveSyncRequest(request.body));
    return response.status(result.upstreamStatus).json(result.summary);
  } catch (error) {
    if (error instanceof DriveSyncRequestError) return response.status(400).json({ error: error.message, code: "BACKEND_REJECTED" });
    const mapped = mapBackendError(error);
    return response.status(mapped.status).json(mapped.body);
  }
}
