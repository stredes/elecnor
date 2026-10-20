import type { NextApiRequest, NextApiResponse } from "next";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { procedureReader } from "@/backend/composition/procedures";
import type { ProcedureCatalogResult } from "@/backend/domain/procedures/procedure-contract";

export default async function procedures(
  request: NextApiRequest,
  response: NextApiResponse<ProcedureCatalogResult | BackendErrorBody>,
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" });
  }
  try {
    const q = text(request.query.q);
    const area = text(request.query.area);
    return response.status(200).json(await procedureReader.catalog({ q, area }));
  } catch (error) {
    const mapped = mapBackendError(error);
    return response.status(mapped.status).json(mapped.body);
  }
}

function text(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}
