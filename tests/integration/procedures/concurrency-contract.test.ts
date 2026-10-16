import { describe, expect, it } from "vitest";
import { MemoryProcedureCommitter } from "@/backend/adapters/outbound/memory-procedure-creation";

describe("NP-0039/AC-02/TEST-05 reservation concurrency", () => {
  it("rejects a second reservation while the first is pending", async () => {
    const committer = new MemoryProcedureCommitter();

    const first = await committer.reserve("same-key", "same-fingerprint");
    const second = await committer.reserve("same-key", "same-fingerprint");

    expect(first.kind).toBe("NEW");
    expect(second).toEqual({ kind: "CONFLICT" });
  });
});
