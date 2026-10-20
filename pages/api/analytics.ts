import type { NextApiRequest, NextApiResponse } from "next";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { analyticsReader } from "@/backend/composition/read-models";
import type { ReportingAnalytics } from "@/backend/domain/analytics/analytics-contract";

export default async function analytics(request: NextApiRequest, response: NextApiResponse<ReportingAnalytics | BackendErrorBody>) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" });
  }
  try {
    return response.status(200).json(await analyticsReader.read(integer(request.query.minimo), integer(request.query.limite)));
  } catch (error) {
    const mapped = mapBackendError(error);
    return response.status(mapped.status).json(mapped.body);
  }
}

function integer(value: string | string[] | undefined): number | undefined {
  if (typeof value !== "string" || !/^\d+$/u.test(value)) return undefined;
  return Number(value);
}
