import type { ImportFile } from "../../domain/import-files";

export class ImportFormError extends Error {
  public constructor() {
    super("El campo files debe contener archivos.");
    this.name = "ImportFormError";
  }
}

export function importFilesFromFormData(form: FormData): ImportFile[] {
  return form.getAll("files").map((value) => {
    if (!isFile(value)) throw new ImportFormError();
    return { name: value.name, size: value.size };
  });
}

function isFile(value: FormDataEntryValue): value is File {
  return (
    typeof value !== "string" &&
    typeof value.name === "string" &&
    typeof value.size === "number"
  );
}
