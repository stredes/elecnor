import type { NextApiRequest, NextApiResponse } from "next";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { streamInlinePdf } from "@/backend/adapters/inbound/download-response";
import { parseResourceId, ResourceIdError } from "@/backend/adapters/inbound/resource-id";
import { procedureDownloadReader } from "@/backend/composition/procedure-download";
import { createDownloadAssertion, DownloadIdentityError } from "@/backend/composition/download-identity";

export const config = { api: { responseLimit: "8mb" } };

export default async function procedureDownload(request: NextApiRequest, response: NextApiResponse<BackendErrorBody>) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" });
  }
  try {
    const assertion = await createDownloadAssertion(request);
    return await streamInlinePdf(response, await procedureDownloadReader.download(parseResourceId(request.query.id), assertion));
  } catch (error) {
    if (error instanceof DownloadIdentityError) return response.status(error.status).json({ error: error.message, code: error.status === 503 ? "BACKEND_CONFIGURATION" : "BACKEND_REJECTED" });
    if (error instanceof ResourceIdError) return response.status(400).json({ error: error.message, code: "BACKEND_REJECTED" });
    const mapped = mapBackendError(error);
    return response.status(mapped.status).json(mapped.body);
  }
}
