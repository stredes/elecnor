import type { NextApiRequest, NextApiResponse } from "next";

type HealthResponse = { status: "ok"; service: "elecnor-dashboard" };

export default function health(
  _request: NextApiRequest,
  response: NextApiResponse<HealthResponse>,
) {
  response.status(200).json({ status: "ok", service: "elecnor-dashboard" });
}
