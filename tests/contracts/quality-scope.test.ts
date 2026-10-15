import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const script = "scripts/quality/check-lines.mjs";

function run(root: string, files: string[]): { code: number; output: string } {
  try {
    return { code: 0, output: execFileSync(process.execPath, [script, "--root", root, "--json", "--changed", "--files", files.join(",")], { encoding: "utf8" }) };
  } catch (error) {
    const result = error as { status?: number; stdout?: string; stderr?: string };
    return { code: result.status ?? 1, output: `${result.stdout ?? ""}${result.stderr ?? ""}` };
  }
}

describe("NP-0029/AC-03/TEST-03 changed-file quality scope", () => {
  it("checks changed code and reports explicit documentation exclusions", () => {
    const root = mkdtempSync(join(tmpdir(), "np0029-scope-"));
    try {
      mkdirSync(dirname(join(root, "src/legacy.ts")), { recursive: true });
      mkdirSync(dirname(join(root, "docs/guide.md")), { recursive: true });
      writeFileSync(join(root, "src/legacy.ts"), Array.from({ length: 100 }, () => "x").join("\n"));
      writeFileSync(join(root, "docs/guide.md"), Array.from({ length: 140 }, () => "x").join("\n"));
      const report = run(root, ["src/legacy.ts", "docs/guide.md"]);
      const parsed = JSON.parse(report.output);

      expect(parsed.scope).toBe("changed");
      expect(report.code).toBe(1);
      expect(parsed.files.find((file: { path: string }) => file.path === "docs/guide.md").status).toBe("excluded");
      expect(parsed.failures).toContain("src/legacy.ts: 100 lines (maximum 99)");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
