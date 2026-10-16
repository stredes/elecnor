import { describe, expect, it, vi } from "vitest";
import { ExtractDocument } from "@/backend/application/extract-document";
import { validCExtractDocument } from "./c-extract-fixtures";

describe("NP-0031/AC-02/TEST-02 extraction input boundaries", () => {
  it("rejects empty, non-PDF and oversized inputs before the port", async () => {
    const extract = vi.fn(async () => validCExtractDocument);
    const command = new ExtractDocument({ extract }, { maxBytes: 4 });

    await expect(command.execute({ name: "empty.pdf", content: new Uint8Array() }))
      .rejects.toMatchObject({ code: "EMPTY" });
    await expect(command.execute({ name: "synthetic.txt", content: new Uint8Array([1]) }))
      .rejects.toMatchObject({ code: "INVALID_FILENAME" });
    await expect(command.execute({ name: "large.pdf", content: new Uint8Array(5) }))
      .rejects.toMatchObject({ code: "TOO_LARGE" });
    expect(extract).not.toHaveBeenCalled();
  });

  it("delegates an input at the configured limit without retaining it", async () => {
    const extract = vi.fn(async () => validCExtractDocument);
    const command = new ExtractDocument({ extract }, { maxBytes: 4 });
    const document = { name: "synthetic.pdf", content: new Uint8Array([1, 2, 3, 4]) };

    await expect(command.execute(document)).resolves.toEqual(validCExtractDocument);
    expect(extract).toHaveBeenCalledWith(document);
  });
});
