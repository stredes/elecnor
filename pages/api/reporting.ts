import type { NextApiRequest, NextApiResponse } from "next";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { reportingViewQuery } from "@/backend/composition/reporting-view";
import { toLegacyDashboardModel, type LegacyDashboardModel } from "@/dashboard/contracts/legacy-dashboard-contract";

export default async function reporting(request: NextApiRequest, response: NextApiResponse<LegacyDashboardModel | BackendErrorBody>) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ code: "BACKEND_REJECTED", error: "Método no permitido." });
  }
  try {
    const payload = await reportingViewQuery.execute();
    return response.status(200).json(toLegacyDashboardModel(payload));
  } catch (error) {
    const mapped = mapBackendError(error);
    return response.status(mapped.status).json(mapped.body);
  }
}
