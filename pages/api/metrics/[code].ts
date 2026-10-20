import type { NextApiRequest, NextApiResponse } from "next";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { metricsReader } from "@/backend/composition/read-models";
import type { MetricDetail } from "@/backend/domain/read-models/metric-contract";

export default async function metricDetail(request: NextApiRequest, response: NextApiResponse<MetricDetail | BackendErrorBody>) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" });
  }
  const code = typeof request.query.code === "string" ? request.query.code : "";
  if (!/^[A-Za-z0-9_-]{1,100}$/u.test(code)) return response.status(400).json({ error: "Código de métrica inválido.", code: "BACKEND_REJECTED" });
  try {
    const result = await metricsReader.detail(code);
    return result ? response.status(200).json(result) : response.status(404).json({ error: "Métrica no encontrada.", code: "BACKEND_REJECTED" });
  } catch (error) {
    const mapped = mapBackendError(error);
    return response.status(mapped.status).json(mapped.body);
  }
}
