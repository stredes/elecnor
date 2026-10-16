import type { NextApiRequest, NextApiResponse } from "next";
import { inspectionQuery } from "@/backend/composition/inspections";
import { parseInspectionQuery } from "@/backend/domain/inspection-list-query";
import type { InspectionListResult } from "@/backend/domain/inspection-list-contract";

export default async function inspections(
  request: NextApiRequest,
  response: NextApiResponse<InspectionListResult | { error: string }>,
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método no permitido." });
  }
  try {
    const result = await inspectionQuery.execute(parseInspectionQuery(request.query));
    return response.status(200).json(result);
  } catch {
    return response.status(502).json({ error: "El servicio de inspecciones no está disponible." });
  }
}
