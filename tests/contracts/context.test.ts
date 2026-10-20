import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveBackendSelection } from "@/backend/composition/backend-config";

const projectRoot = process.cwd();

describe("Pages Router backend boundary", () => {
  it("keeps the import BFF in Pages Router", () => {
    expect(existsSync(resolve(projectRoot, "pages/api/import.ts"))).toBe(true);
    expect(existsSync(resolve(projectRoot, "src/app"))).toBe(false);
  });

  it("never enables synthetic data in production", () => {
    const selection = resolveBackendSelection({
      NODE_ENV: "production",
      BACKEND_USE_SYNTHETIC_DATA: "true",
    });
    expect(selection.mode).toBe("unavailable");
  });
});
