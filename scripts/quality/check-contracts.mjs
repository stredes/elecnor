import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const roots = ['pages', 'src'];
const extensions = new Set(['.ts', '.tsx']);
const declaration = /^(?:export\s+)?(?:declare\s+)?(?:type|interface)\s+([A-Z][A-Za-z0-9_]*)/gm;
const inlineReturn = /(?:\bfunction\s+\w+\s*\([^)]*\)|\b(?:const|let)\s+\w+\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+))\s*:\s*\{/g;

function parse(argv) {
  const result = { root: process.cwd(), json: false };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--root') result.root = resolve(argv[++index]);
    if (argv[index] === '--json') result.json = true;
  }
  return result;
}

function walk(directory, result) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path, result);
    else if (extensions.has(path.slice(path.lastIndexOf('.')))) result.push(path);
  }
}

function isContract(path) {
  const normalized = path.replaceAll('\\', '/');
  return /(?:^|\/)(?:contracts?|ports|domain)(?:\/|$)/.test(normalized)
    || /(?:^|[-.])contract\.[^.]+$/.test(normalized);
}

function errorsFor(root, file) {
  if (isContract(file)) return [];
  const path = relative(root, file).replaceAll('\\', '/');
  const content = readFileSync(file, 'utf8');
  const errors = [];
  for (const match of content.matchAll(declaration)) errors.push(`${path}: contract type ${match[1]} belongs in a contract module`);
  if (inlineReturn.test(content)) errors.push(`${path}: inline object type belongs in a contract module`);
  inlineReturn.lastIndex = 0;
  return errors;
}

export function runContractCheck(root = process.cwd()) {
  const files = [];
  roots.forEach((directory) => walk(join(root, directory), files));
  return { files: files.map((file) => relative(root, file).replaceAll('\\', '/')), errors: files.flatMap((file) => errorsFor(root, file)) };
}

function main() {
  const config = parse(process.argv.slice(2));
  const report = runContractCheck(config.root);
  if (config.json) console.log(JSON.stringify(report));
  else report.errors.forEach((error) => console.error(`FAIL ${error}`));
  process.exitCode = report.errors.length ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) main();
