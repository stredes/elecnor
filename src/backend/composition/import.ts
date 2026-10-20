import { ImportFiles } from "../application/import-files";
import { DisabledImportGateway } from "../adapters/outbound/disabled-import-gateway";
import { HttpImportGateway } from "../adapters/outbound/http-import-gateway";
import type { ImportGateway } from "../ports/import-gateway";
import { resolveImportSelection } from "./backend-config";

export function createImportCommand() {
  const selection = resolveImportSelection();
  const gateway: ImportGateway = selection.mode === "http" && selection.url
    ? new HttpImportGateway(
      selection.url, undefined, selection.paths.import,
       { contractVersion: selection.contractVersion, internalToken: selection.internalToken, timeoutMs: selection.timeoutMs },
    )
    : new DisabledImportGateway(selection.error?.message);
  return new ImportFiles(gateway);
}

export const importCommand = createImportCommand();
