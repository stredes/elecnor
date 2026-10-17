import { describe, expect, it } from "vitest";
import { authorizeDownload } from "@/backend/domain/storage/secure-download";

describe("secure download symlink boundary", () => {
  it("NP-0037/AC-02/TEST-04 rejects a file path whose canonical target escapes the approved root", async () => {
    const policy = {
      root: "/srv/inspections",
      allowedRemoteOrigins: [],
      resolveRealPath: async (path: string) => path.endsWith("/linked.pdf") ? "/srv/private/secret.pdf" : path,
    };
    await expect(authorizeDownload({ kind: "file", value: "/srv/inspections/linked.pdf" }, policy)).rejects.toThrow();
  });
});
