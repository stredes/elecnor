import { describe, expect, it } from "vitest";
import {
  ImportSelectionError,
  MAX_IMPORT_FILE_BYTES,
  MAX_IMPORT_FILES,
  validateImportFiles,
} from "@/backend/domain/import-files";

const file = (name: string, size = 1024) => ({ name, size });

describe("NP-0028/AC-02/TEST-04 import file boundary", () => {
  it("accepts up to twenty PDF files at the size limit", () => {
    const files = Array.from({ length: MAX_IMPORT_FILES }, (_, index) =>
      file(`document-${index}.pdf`, MAX_IMPORT_FILE_BYTES),
    );
    expect(() => validateImportFiles(files)).not.toThrow();
  });

  it.each([
    ["empty selection", []],
    ["too many files", Array.from({ length: MAX_IMPORT_FILES + 1 }, () => file("a.pdf"))],
    ["wrong extension", [file("document.docx")]],
    ["oversized PDF", [file("document.pdf", MAX_IMPORT_FILE_BYTES + 1)]],
  ])("rejects %s", (_name, files) => {
    expect(() => validateImportFiles(files)).toThrow(ImportSelectionError);
  });
});
