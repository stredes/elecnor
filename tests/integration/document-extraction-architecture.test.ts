import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ExtractDocument } from "@/backend/application/extract-document";
import { createCExtractReader } from "@/backend/composition/extraction";
import { MemoryCExtractReader } from "@/backend/adapters/outbound/memory-c-extract-reader";
import { validCExtractDocument } from "../contracts/c-extract-fixtures";

const root = process.cwd();
const pureFiles = [
  "src/backend/domain/document-extraction-error.ts",
  "src/backend/application/extract-document.ts",
  "src/backend/ports/c-extract-reader.ts",
];

describe("NP-0031/AC-03/TEST-03 extraction architecture", () => {
  it("substitutes the reader and keeps the disabled default safe", async () => {
    const command = new ExtractDocument(
      new MemoryCExtractReader(validCExtractDocument),
      { maxBytes: 100 },
    );
    await expect(command.execute({ name: "synthetic.pdf", content: new Uint8Array([1]) }))
      .resolves.toEqual(validCExtractDocument);

    const disabled = createCExtractReader("");
    await expect(disabled.extract({ name: "synthetic.pdf", content: new Uint8Array([1]) }))
      .rejects.toMatchObject({ code: "UPSTREAM_UNAVAILABLE" });
  });

  it("keeps pure layers free from runtime and adapter dependencies", () => {
    for (const file of pureFiles) {
      const source = readFileSync(`${root}/${file}`, "utf8");
      expect(source).not.toMatch(/(?:next|react|fetch|formdata|blob|adapters|composition|sqlite|sql)/i);
    }
    const composition = readFileSync(`${root}/src/backend/composition/extraction.ts`, "utf8");
    expect(composition).toContain("HttpCExtractReader");
    expect(composition).toContain("DisabledCExtractReader");
  });
});
