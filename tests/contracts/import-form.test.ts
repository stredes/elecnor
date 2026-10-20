import { describe, expect, it } from "vitest";
import {
  ImportFormError,
  importFilesFromFormData,
} from "@/backend/adapters/inbound/import-form";

function pdf(name: string, content = "%PDF-1.4") {
  return new File([content], name, { type: "application/pdf" });
}

describe("NP-0028/AC-02/TEST-07 multipart boundary", () => {
  it("normalizes repeated files fields and ignores other fields", async () => {
    const form = new FormData();
    form.append("files", pdf("one.pdf"));
    form.append("files", pdf("two.pdf", "%PDF-1.5\nmore"));
    form.append("note", "synthetic fixture");

    await expect(importFilesFromFormData(form)).resolves.toMatchObject([
      { name: "one.pdf", size: 8 },
      { name: "two.pdf", size: 13 },
    ]);
  });

  it("rejects a text value submitted as a file", async () => {
    const form = new FormData();
    form.append("files", "not-a-file");

    await expect(importFilesFromFormData(form)).rejects.toBeInstanceOf(ImportFormError);
  });
});
