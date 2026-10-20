import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseInspectionMutationRequest } from "@/backend/adapters/inbound/inspection-mutation-request";

const root = process.cwd();
const pureFiles = [
  "src/backend/adapters/inbound/inspection-mutation-request.ts",
  "src/backend/application/inspections/update-inspection-metadata.ts",
  "src/backend/domain/inspections/mutation-boundaries.ts",
  "src/backend/domain/inspections/update-policy.ts",
  "src/backend/ports/write-inspection-metadata.ts",
];

describe("NP-0037/AC-03/TEST-03 inspection mutation boundary", () => {
  it("keeps the reversible boundary unactivated and framework-free", () => {
    expect(parseInspectionMutationRequest("inspection-1", { technician: "A" })).toMatchObject({ ok: true });
    for (const file of pureFiles) {
      const source = readFileSync(`${root}/${file}`, "utf8");
      expect(source).not.toMatch(/(?:next|react|sqlite|sql|adapters\/outbound)/i);
    }
    const detailRoute = `${root}/pages/api/inspections/[id].ts`;
    if (existsSync(detailRoute)) {
      expect(readFileSync(detailRoute, "utf8")).not.toMatch(/(?:POST|PUT|PATCH|DELETE)/u);
    }
    expect(existsSync(`${root}/src/backend/composition/inspection-mutations.ts`)).toBe(false);
  });
});
