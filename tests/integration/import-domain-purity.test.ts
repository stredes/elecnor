import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  classifyAnswer,
  determineImportStatus,
  normalizeText,
} from "@/backend/domain/import-domain";
import { importDomainContract } from "@/backend/domain/import-domain-contract";
import type { ImportDomainPolicy } from "@/backend/domain/import-domain-contract";
import { validImportFacts } from "../contracts/import-fixtures";

const root = process.cwd();
const pureFiles = [
  "src/backend/domain/import-domain.ts",
  "src/backend/domain/import-domain-contract.ts",
  "src/backend/domain/import-facts-contract.ts",
  "src/backend/domain/import-draft-contract.ts",
  "src/backend/domain/import-normalization.ts",
  "src/backend/domain/import-rubric.ts",
  "src/backend/domain/determine-import-status.ts",
  "src/backend/domain/logical-key.ts",
];

const policy: ImportDomainPolicy = {
  normalizeText,
  classifyAnswer,
  determineImportStatus,
};

describe("NP-0032/AC-03/TEST-03 import domain purity", () => {
  it("exposes pure policies through a stable domain facade", () => {
    expect(normalizeText("ÁREA ß")).toBe("area ss");
    expect(classifyAnswer("N/A").notApplicable).toBe(1);
    expect(classifyAnswer("Conformidad").conforming).toBe(1);
    expect(classifyAnswer("No Conformidad").nonConforming).toBe(1);
    expect(policy.determineImportStatus(validImportFacts)).toBe("COMPLETA");
    expect(importDomainContract.normalizeText("Sí")).toBe("si");
  });

  it("keeps interpretation files free of runtime and persistence dependencies", () => {
    for (const file of pureFiles) {
      const source = readFileSync(`${root}/${file}`, "utf8");
      expect(source).not.toMatch(
        /\b(?:next|react|http|fetch|sql|sqlite|pdf|ports)\b|process\.env/iu,
      );
    }
  });
});
