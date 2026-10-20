import type { NextApiRequest, NextApiResponse } from "next";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { streamPdf } from "@/backend/adapters/inbound/download-response";
import { parseResourceId, ResourceIdError } from "@/backend/adapters/inbound/resource-id";
import { documentDownloadReader } from "@/backend/composition/document-download";

export default async function documentDownload(request: NextApiRequest, response: NextApiResponse<BackendErrorBody>) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" });
  }
  try {
    return await streamPdf(response, await documentDownloadReader.download("document", parseResourceId(request.query.id)));
  } catch (error) {
    if (error instanceof ResourceIdError) return response.status(400).json({ error: error.message, code: "BACKEND_REJECTED" });
    const mapped = mapBackendError(error);
    return response.status(mapped.status).json(mapped.body);
  }
}
