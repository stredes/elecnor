import type { NextApiRequest, NextApiResponse } from "next";
import { procedureQuery } from "@/backend/composition/procedures";
import { toPublicProcedureList } from "@/backend/adapters/inbound/procedure-response";
import type { ProcedureErrorResponse, PublicProcedureList } from "@/backend/adapters/inbound/procedure-response-contract";

export default async function procedures(
  request: NextApiRequest,
  response: NextApiResponse<PublicProcedureList | ProcedureErrorResponse>,
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método no permitido." });
  }
  try {
    const result = await procedureQuery.execute({ q: queryValue(request.query.q), area: queryValue(request.query.area) });
    return response.status(200).json(toPublicProcedureList(result));
  } catch {
    return response.status(502).json({ error: "El servicio de procedimientos no está disponible." });
  }
}

function queryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
