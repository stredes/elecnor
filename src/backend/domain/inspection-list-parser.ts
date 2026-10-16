import type {
  InspectionListItem,
  InspectionListResult,
} from "./inspection-list-contract";

const RESULT_FIELDS = ["data", "total", "limit", "offset", "dates", "auditors", "regions"];
const ITEM_FIELDS = ["id", "date", "time", "technician", "auditor", "address", "city", "region", "percentage", "score", "maxScore", "actions", "rubric", "status", "filename"];

export class InspectionListContractError extends Error {
  public constructor() {
    super("Respuesta de inspecciones inválida.");
    this.name = "InspectionListContractError";
  }
}

export function parseInspectionList(value: unknown): InspectionListResult {
  if (!record(value) || !exact(value, RESULT_FIELDS) || !Array.isArray(value.data)) throw new InspectionListContractError();
  if (!value.data.every(item)) throw new InspectionListContractError();
  if (!["dates", "auditors", "regions"].every((key) => strings(value[key]))) throw new InspectionListContractError();
  if (!["total", "limit", "offset"].every((key) => integer(value[key]))) throw new InspectionListContractError();
  return value as InspectionListResult;
}

function item(value: unknown): value is InspectionListItem {
  if (!record(value) || !exact(value, ITEM_FIELDS) || typeof value.id !== "string") return false;
  if (value.status !== "COMPLETA" && value.status !== "PARCIAL") return false;
  return ["date", "time", "technician", "auditor", "address", "city", "region", "rubric", "filename"]
    .every((key) => value[key] === null || typeof value[key] === "string")
    && ["percentage", "score", "maxScore", "actions"].every((key) => value[key] === null || number(value[key]));
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exact(value: Record<string, unknown>, fields: string[]): boolean {
  const keys = Object.keys(value);
  return keys.length === fields.length && fields.every((field) => keys.includes(field));
}

function number(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function integer(value: unknown): value is number {
  return number(value) && Number.isInteger(value) && value >= 0;
}

function strings(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
