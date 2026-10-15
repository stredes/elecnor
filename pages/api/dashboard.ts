import type { NextApiRequest, NextApiResponse } from "next";
import { dashboardQuery } from "@/backend/composition/dashboard";
import type { DashboardResponse } from "@/backend/adapters/inbound/dashboard-response-contract";

export default async function dashboard(
  request: NextApiRequest,
  response: NextApiResponse<DashboardResponse>,
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ code: "METHOD_NOT_ALLOWED" });
  }

  try {
    return response.status(200).json(await dashboardQuery.execute());
  } catch {
    return response.status(502).json({ code: "BACKEND_UNAVAILABLE" });
  }
}
