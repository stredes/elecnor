import { describe, expect, it } from "vitest";
import {
  attachmentName,
  authorizeDownload,
} from "@/backend/domain/storage/secure-download";

const policy = {
  root: "/srv/inspections",
  allowedRemoteOrigins: ["https://blob.test"],
  resolveRealPath: async (path: string) => path,
};

describe("secure download policy", () => {
  it("confines local files and accepts only an injected HTTPS origin allowlist", async () => {
    await expect(authorizeDownload({ kind: "file", value: "/srv/inspections/original.pdf" }, policy)).resolves.toEqual({
      kind: "file", value: "/srv/inspections/original.pdf",
    });
    await expect(authorizeDownload({ kind: "remote", value: "https://blob.test/original.pdf" }, policy)).resolves.toEqual({
      kind: "remote", value: "https://blob.test/original.pdf",
    });
  });

  it("rejects traversal, credentials and unapproved origins", async () => {
    await expect(authorizeDownload({ kind: "file", value: "/srv/inspections/../secret.pdf" }, policy)).rejects.toThrow();
    await expect(authorizeDownload({ kind: "remote", value: "https://evil.test/file.pdf" }, policy)).rejects.toThrow();
    await expect(authorizeDownload({ kind: "remote", value: "https://user:pass@blob.test/file.pdf" }, policy)).rejects.toThrow();
  });

  it("sanitizes an attachment filename", () => {
    expect(attachmentName("report\"/\r\n.pdf")).toBe("report.pdf");
  });
});
