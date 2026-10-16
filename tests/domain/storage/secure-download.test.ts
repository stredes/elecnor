import { describe, expect, it } from "vitest";
import {
  attachmentName,
  authorizeDownload,
} from "@/backend/domain/storage/secure-download";

const policy = { root: "/srv/inspections", allowedRemoteOrigins: ["https://blob.test"] };

describe("secure download policy", () => {
  it("confines local files and accepts only an injected HTTPS origin allowlist", () => {
    expect(authorizeDownload({ kind: "file", value: "/srv/inspections/original.pdf" }, policy)).toEqual({
      kind: "file", value: "/srv/inspections/original.pdf",
    });
    expect(authorizeDownload({ kind: "remote", value: "https://blob.test/original.pdf" }, policy)).toEqual({
      kind: "remote", value: "https://blob.test/original.pdf",
    });
  });

  it("rejects traversal, credentials and unapproved origins", () => {
    expect(() => authorizeDownload({ kind: "file", value: "/srv/inspections/../secret.pdf" }, policy)).toThrow();
    expect(() => authorizeDownload({ kind: "remote", value: "https://evil.test/file.pdf" }, policy)).toThrow();
    expect(() => authorizeDownload({ kind: "remote", value: "https://user:pass@blob.test/file.pdf" }, policy)).toThrow();
  });

  it("sanitizes an attachment filename", () => {
    expect(attachmentName("report\"/\r\n.pdf")).toBe("report.pdf");
  });
});
