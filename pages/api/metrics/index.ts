import type { NextApiRequest, NextApiResponse } from "next";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { metricsReader } from "@/backend/composition/read-models";
import type { MetricListResult } from "@/backend/domain/read-models/metric-contract";

export default async function metrics(request: NextApiRequest, response: NextApiResponse<MetricListResult | BackendErrorBody>) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" });
  }
  try {
    const band = typeof request.query.band === "string" ? request.query.band : "all";
    return response.status(200).json(await metricsReader.list(band));
  } catch (error) {
    const mapped = mapBackendError(error);
    return response.status(mapped.status).json(mapped.body);
  }
}
