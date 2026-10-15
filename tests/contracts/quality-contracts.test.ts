import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const script = "scripts/quality/check-contracts.mjs";

function write(root: string, path: string, content: string): void {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

function run(root: string): { code: number; output: string } {
  try {
    return { code: 0, output: execFileSync(process.execPath, [script, "--root", root, "--json"], { encoding: "utf8" }) };
  } catch (error) {
    const result = error as { status?: number; stdout?: string; stderr?: string };
    return { code: result.status ?? 1, output: `${result.stdout ?? ""}${result.stderr ?? ""}` };
  }
}

describe("contract separation gate", () => {
  it("requires implementation types to live in a contract module", () => {
    const root = mkdtempSync(join(tmpdir(), "np0029-contracts-"));
    try {
      write(root, "src/components/view.ts", "type ViewProps = { title: string }; export const view = true;");
      const inline = run(root);
      expect(inline.code).toBe(1);
      expect(inline.output).toContain("ViewProps");

      rmSync(join(root, "src/components/view.ts"));
      write(root, "src/contracts/view.ts", "export type ViewProps = { title: string };");
      write(root, "src/components/view.ts", 'import type { ViewProps } from "../contracts/view"; export const view: ViewProps = { title: "ok" };');
      expect(run(root).code).toBe(0);

      write(root, "src/components/inline.ts", "export function build(): { ok: boolean } { return { ok: true }; }");
      const returned = run(root);
      expect(returned.code).toBe(1);
      expect(returned.output).toContain("inline object type");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
