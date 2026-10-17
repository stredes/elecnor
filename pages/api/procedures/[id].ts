import type { NextApiRequest, NextApiResponse } from "next";
import { procedureQuery } from "@/backend/composition/procedures";
import { toPublicProcedure } from "@/backend/adapters/inbound/procedure-response";
import type { ProcedureErrorResponse, PublicProcedure } from "@/backend/adapters/inbound/procedure-response-contract";

export default async function procedureDetail(
  request: NextApiRequest,
  response: NextApiResponse<PublicProcedure | ProcedureErrorResponse>,
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método no permitido." });
  }
  try {
    const procedure = await procedureQuery.get(queryValue(request.query.id));
    if (!procedure) return response.status(404).json({ error: "Procedimiento no encontrado." });
    return response.status(200).json(toPublicProcedure(procedure));
  } catch {
    return response.status(502).json({ error: "El servicio de procedimientos no está disponible." });
  }
}

function queryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
