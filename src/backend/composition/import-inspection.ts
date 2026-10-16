import { ImportInspection } from "../application/import-inspection";
import { InterpretDocument } from "../application/interpret-document";
import type { ImportInspectionDependencies } from "./import-inspection-contract";

export function createImportInspection(
  dependencies: ImportInspectionDependencies,
): ImportInspection {
  const interpreter = new InterpretDocument(dependencies.catalog, dependencies.hash);
  return new ImportInspection(
    dependencies.processor,
    interpreter,
    dependencies.repository,
  );
}
