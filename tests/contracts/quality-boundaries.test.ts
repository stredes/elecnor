import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const script = "scripts/quality/check-boundaries.mjs";

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

describe("NP-0029/AC-02/TEST-02 architecture boundary gate", () => {
  it("rejects framework imports in domain and cycles, while accepting composition", () => {
    const root = mkdtempSync(join(tmpdir(), "np0029-boundaries-"));
    try {
      write(root, "src/backend/domain/rule.ts", 'import "next"; export const rule = true;');
      const illegal = run(root);
      expect(illegal.code).toBe(1);
      expect(illegal.output).toContain("domain");
      expect(illegal.output).toContain("next");

      rmSync(join(root, "src/backend/domain/rule.ts"));
      write(root, "src/backend/domain/rule.ts", "export const rule = true;");
      write(root, "src/backend/application/use.ts", 'import { rule } from "../domain/rule"; export { rule };');
      write(root, "src/backend/ports/rule.ts", 'import { rule } from "../domain/rule"; export { rule };');
      write(root, "src/backend/adapters/outbound/adapter.ts", 'import { rule } from "../../ports/rule"; export { rule };');
      write(root, "src/backend/composition/root.ts", 'import { rule } from "../application/use"; export { rule };');
      expect(run(root).code).toBe(0);

      write(root, "src/backend/application/a.ts", 'import "./b";');
      write(root, "src/backend/application/b.ts", 'import "./a";');
      const cycle = run(root);
      expect(cycle.code).toBe(1);
      expect(cycle.output).toContain("cycle");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
