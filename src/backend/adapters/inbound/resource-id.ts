export class ResourceIdError extends Error {
  public constructor() { super("Identificador de recurso inválido."); this.name = "ResourceIdError"; }
}

export function parseResourceId(value: unknown): string {
  if (typeof value !== "string") fail();
  const id = value.trim();
  if (!id || id.length > 128 || /[\\/?#\u0000-\u001f]/u.test(id) || id.includes("..")) fail();
  return id;
}

export function queryId(value: string | string[] | undefined): string | null {
  if (value === undefined) return null;
  if (Array.isArray(value) || !value) fail();
  return parseResourceId(value);
}

function fail(): never { throw new ResourceIdError(); }
