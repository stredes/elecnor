import { determineImportStatus } from "./determine-import-status";
import type { ImportStatus } from "./import-draft-contract";
import type { ExtractedInspectionFacts } from "./import-facts-contract";
import {
  classifyAnswer,
  normalizeText,
  type AnswerClassification,
} from "./import-normalization";

export type ImportDomainPolicy = {
  readonly normalizeText: (value: string | null) => string;
  readonly classifyAnswer: (value: string | null) => AnswerClassification;
  readonly determineImportStatus: (facts: ExtractedInspectionFacts) => ImportStatus;
};

export const importDomainContract: ImportDomainPolicy = {
  normalizeText,
  classifyAnswer,
  determineImportStatus,
};
