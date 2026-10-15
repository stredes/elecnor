import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const brainCli = resolve(
  projectRoot,
  "node_modules/@hc-soluciones/engineering-brain/bin/hc.mjs",
);
const expectedFailure =
  "El contexto autorizado y la adaptación de router todavía no tienen una prueba ejecutable.";

function readJson(path: string) {
  return JSON.parse(readFileSync(resolve(projectRoot, path), "utf8"));
}

describe("active story Brain context contract", () => {
  it("validates Brain, task and story context", () => {
    const output = execFileSync(
      process.execPath,
      [brainCli, "context", "--test", "TEST-01", "--project", projectRoot],
      { encoding: "utf8" },
    );
    const context = JSON.parse(output);
    const project = readJson(".hc/project.json");
    const task = readJson(".hc/task.json");

    expect(project.brain_version).toBe("5.0.1");
    expect(task.task.story_path).toBe(`.hc/stories/${task.task.id}.json`);
    expect(context.capsule.test_id).toBe("TEST-01");
  });

  it("requires the Pages API import boundary", () => {
    if (!existsSync(resolve(projectRoot, "pages/api/import.ts"))) {
      throw new Error(expectedFailure);
    }
  });

  it("keeps the App Router boundary absent", () => {
    expect(existsSync(resolve(projectRoot, "src/app"))).toBe(false);
  });
});
