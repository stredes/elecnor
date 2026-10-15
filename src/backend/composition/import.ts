import { ImportFiles } from "../application/import-files";
import { DisabledImportGateway } from "../adapters/outbound/disabled-import-gateway";

export const importCommand = new ImportFiles(new DisabledImportGateway());
