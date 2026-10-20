import type { NextApiRequest, NextApiResponse } from "next";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { streamFile } from "@/backend/adapters/inbound/download-response";
import { reportExportReader } from "@/backend/composition/report-export";

export default async function exportExcel(request: NextApiRequest, response: NextApiResponse<BackendErrorBody>) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" });
  }
  try {
    return await streamFile(response, await reportExportReader.download());
  } catch (error) {
    const mapped = mapBackendError(error);
    return response.status(mapped.status).json(mapped.body);
  }
}
