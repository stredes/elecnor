import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const script = "scripts/quality/check-lines.mjs";

function lines(count: number, newline: string): string {
  return Array.from({ length: count }, () => "x").join(newline) + newline;
}

function run(root: string, files?: string[]): { code: number; output: string } {
  try {
    return { code: 0, output: execFileSync(process.execPath, [script, "--root", root, "--json", ...(files ? ["--files", files.join(",")] : [])], { encoding: "utf8" }) };
  } catch (error) {
    const result = error as { status?: number; stdout?: string; stderr?: string };
    return { code: result.status ?? 1, output: `${result.stdout ?? ""}${result.stderr ?? ""}` };
  }
}

describe("NP-0029/AC-01/TEST-01 line quality gate", () => {
  it("counts physical lines, CRLF and Unicode without accepting 100", () => {
    const root = mkdtempSync(join(tmpdir(), "np0029-lines-"));
    try {
      writeFileSync(join(root, "src-ok.ts"), lines(99, "\n"));
      writeFileSync(join(root, "src-crlf.ts"), lines(99, "\r\n"));
      writeFileSync(join(root, "src-unicode.ts"), "a\u2028b");
      writeFileSync(join(root, "src-too-long.ts"), lines(100, "\n"));
      const valid = run(root, ["src-ok.ts", "src-crlf.ts", "src-unicode.ts"]);
      const invalid = run(root, ["src-too-long.ts"]);

      expect(valid.code).toBe(0);
      expect(JSON.parse(valid.output).files.every((file: { lines: number }) => file.lines <= 99)).toBe(true);
      expect(invalid.code).toBe(1);
      expect(invalid.output).toContain('"lines":100');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
