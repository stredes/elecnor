const EDITABLE_FIELDS = [
  "technician", "auditor", "auditorRole", "date", "time", "address", "city", "region", "observation",
] as const;

type EditableField = (typeof EDITABLE_FIELDS)[number];
type Changes = Partial<Record<EditableField, string | null>>;

export type InspectionMetadataUpdate = {
  readonly changes: Changes;
  readonly status: "PARCIAL";
};

export function buildInspectionMetadataUpdate(value: unknown): InspectionMetadataUpdate {
  if (!record(value)) throw new Error("Invalid inspection update");
  const changes: Changes = {};
  for (const [rawKey, rawValue] of Object.entries(value)) {
    if (!EDITABLE_FIELDS.includes(rawKey as EditableField)) throw new Error("Field is not editable");
    if (rawValue !== null && typeof rawValue !== "string") throw new Error("Editable fields must be text");
    const cap = rawKey === "date" || rawKey === "time" ? 32 : 500;
    if (typeof rawValue === "string" && rawValue.length > cap) throw new Error("Editable field is too long");
    changes[rawKey as EditableField] = rawValue;
  }
  if (Object.keys(changes).length === 0) throw new Error("No editable fields");
  return { changes, status: "PARCIAL" };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
