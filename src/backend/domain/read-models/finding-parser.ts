import type { Finding, FindingResult } from "./finding-contract";

export class FindingContractError extends Error {
  public constructor() { super("Respuesta de hallazgos inválida."); this.name = "FindingContractError"; }
}

export function parseFindings(value: unknown): FindingResult {
  const root = record(value);
  if (!root || !exact(root, ["count", "data"]) || !integer(root.count) || !Array.isArray(root.data)) fail();
  return { count: root.count, data: root.data.map(parseItem) };
}

function parseItem(value: unknown): Finding {
  const item = record(value);
  if (!item || !exact(item, ["id", "inspection_id", "date", "section", "metric", "response", "observation", "action_status"])) fail();
  if (typeof item.id !== "string" || typeof item.inspection_id !== "string" || !nullableText(item.date) || !nullableText(item.section) || typeof item.metric !== "string" || !nullableText(item.response) || !nullableText(item.observation) || typeof item.action_status !== "string") fail();
  return { id: item.id as string, inspectionId: item.inspection_id as string, date: item.date as string | null, section: item.section as string | null, metric: item.metric as string, response: item.response as string | null, observation: item.observation as string | null, actionStatus: item.action_status as string };
}

function record(value: unknown): Record<string, unknown> | null { return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null; }
function exact(value: Record<string, unknown>, fields: readonly string[]): boolean { return Object.keys(value).length === fields.length && fields.every((field) => field in value); }
function nullableText(value: unknown): boolean { return value === null || typeof value === "string"; }
function integer(value: unknown): value is number { return typeof value === "number" && Number.isInteger(value) && value >= 0; }
function fail(): never { throw new FindingContractError(); }
