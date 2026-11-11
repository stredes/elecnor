import type { NextApiRequest, NextApiResponse } from "next";
import { mapBackendError, type BackendErrorBody } from "@/backend/adapters/inbound/backend-error-response";
import { elecnorComparisonReader } from "@/backend/composition/elecnor-comparison";
import type { ElecnorComparisonDirection, ElecnorComparisonResult, ElecnorComparisonSort, ElecnorComparisonStatus } from "@/backend/domain/elecnor-contract";
export default async function handler(request: NextApiRequest, response: NextApiResponse<ElecnorComparisonResult | BackendErrorBody>) {
  if (request.method !== "GET") { response.setHeader("Allow", "GET"); return response.status(405).json({ error: "Método no permitido.", code: "BACKEND_REJECTED" }); }
  try { return response.status(200).json(await elecnorComparisonReader.list({ q: text(request.query.q), status: status(request.query.status), limit: positive(request.query.limit, 50), offset: nonNegative(request.query.offset), sort: sort(request.query.sort), direction: direction(request.query.direction) })); } catch (error) { const mapped = mapBackendError(error); return response.status(mapped.status).json(mapped.body); }
}
function text(value: string | string[] | undefined): string { return typeof value === "string" ? value : ""; }
function positive(value: string | string[] | undefined, fallback: number): number { const n = Number(text(value)); return Number.isInteger(n) && n > 0 && n <= 500 ? n : fallback; }
function nonNegative(value: string | string[] | undefined): number { const n = Number(text(value)); return Number.isInteger(n) && n >= 0 ? n : 0; }
function status(value: string | string[] | undefined): ElecnorComparisonStatus { const candidate = text(value); return ["all", "with_inspection", "without_inspection", "reviewed", "pending_review"].includes(candidate) ? candidate as ElecnorComparisonStatus : "all"; }
function sort(value: string | string[] | undefined): ElecnorComparisonSort { const candidate = text(value); return ["name", "rut", "audits", "approval"].includes(candidate) ? candidate as ElecnorComparisonSort : "name"; }
function direction(value: string | string[] | undefined): ElecnorComparisonDirection { return text(value) === "desc" ? "desc" : "asc"; }
