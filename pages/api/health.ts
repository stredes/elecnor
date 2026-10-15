import type { NextApiRequest, NextApiResponse } from "next";
import type { HealthResponse } from "@/backend/adapters/inbound/health-response-contract";

export default function health(
  _request: NextApiRequest,
  response: NextApiResponse<HealthResponse>,
) {
  response.status(200).json({ status: "ok", service: "elecnor-dashboard" });
}
