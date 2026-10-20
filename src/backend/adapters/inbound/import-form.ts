import type { ImportFile } from "../../domain/import-files";
import type { BackendProvenance } from "../../domain/backend-contract";

export class ImportFormError extends Error {
  public constructor() {
    super("El campo files debe contener archivos.");
    this.name = "ImportFormError";
  }
}

export async function importFilesFromFormData(form: FormData): Promise<ImportFile[]> {
  const legacyIds = form.getAll("legacy_id");
  const provenance = form.getAll("provenance");
  return Promise.all(form.getAll("files").map(async (value, index) => {
    if (!isFile(value)) throw new ImportFormError();
    return {
      name: value.name,
      size: value.size,
      content: await readContent(value),
      legacyId: text(legacyIds[index]),
      provenance: parseProvenance(provenance[index]),
    };
  }));
}

async function readContent(value: File): Promise<Uint8Array> {
  if (typeof value.arrayBuffer === "function") {
    return new Uint8Array(await value.arrayBuffer());
  }
  if (typeof FileReader === "undefined") throw new ImportFormError();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new ImportFormError());
    reader.onload = () => {
      if (!(reader.result instanceof ArrayBuffer)) return reject(new ImportFormError());
      resolve(new Uint8Array(reader.result));
    };
    reader.readAsArrayBuffer(value);
  });
}

function isFile(value: FormDataEntryValue): value is File {
  return (
    typeof value !== "string" &&
    typeof value.name === "string" &&
    typeof value.size === "number"
  );
}

function text(value: FormDataEntryValue | undefined): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseProvenance(value: FormDataEntryValue | undefined): BackendProvenance | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    return isObject(parsed) ? parsed : undefined;
  } catch {
    throw new ImportFormError();
  }
}

function isObject(value: unknown): value is BackendProvenance {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
