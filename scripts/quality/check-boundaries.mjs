import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const roots = ['pages', 'src'];
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
const importPattern = /(?:\bfrom\s*|\bimport\s*|\brequire\s*\()\s*["']([^"']+)["']/g;
const forbiddenRuntime = /^(?:next(?:\/|$)|react(?:\/|$)|node:(?:fs|path|process|child_process|http|https|net|stream)|(?:pg|sqlite3|better-sqlite3|typeorm|prisma)(?:\/|$))/;
function options(argv) {
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
    else if (extensions.includes(path.slice(path.lastIndexOf('.')))) result.push(path);
  }
}
function sourceFiles(root) {
  const result = [];
  roots.forEach((directory) => walk(join(root, directory), result)); return result;
}
const imports = (content) => [...content.matchAll(importPattern)].map((match) => match[1]);
function resolveImport(file, specifier, root, known) {
  if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return null;
  const base = specifier.startsWith('@/') ? join(root, 'src', specifier.slice(2)) : resolve(dirname(file), specifier);
  const candidates = [base, ...extensions.map((extension) => `${base}${extension}`), ...extensions.map((extension) => join(base, `index${extension}`))];
  return candidates.find((candidate) => known.has(candidate)) ?? null;
}
const relativePath = (root, file) => relative(root, file).replaceAll('\\', '/');
function boundaryErrors(root, file, specifier) {
  const path = relativePath(root, file);
  const backend = path.startsWith('src/backend/');
  const forbiddenLayer = /(?:^|\/)(?:domain|application|ports)(?:\/|$)/.test(path);
  const illegalAdapter = /(?:^|\/)adapters\//.test(specifier);
  const illegalComposition = /(?:^|\/)composition\//.test(specifier);
  const errors = [];
  if (backend && forbiddenLayer && (forbiddenRuntime.test(specifier) || illegalAdapter || illegalComposition)) {
    errors.push(`${path}: forbidden import ${specifier}`);
  }
  if (path.startsWith('src/backend/domain/') && /(?:^|\/)(?:application|ports)\//.test(specifier)) {
    errors.push(`${path}: domain cannot depend on ${specifier}`);
  }
  if (path.startsWith('src/backend/application/') && illegalComposition) {
    errors.push(`${path}: application cannot depend on ${specifier}`);
  }
  if (path.startsWith('src/dashboard/') && (specifier.startsWith('node:') || /\/backend\/(?:adapters|composition)\//.test(specifier))) {
    errors.push(`${path}: browser code cannot import ${specifier}`);
  }
  return errors;
}
function cycles(graph) {
  const state = new Map();
  const stack = [];
  const found = [];
  function visit(node) {
    if (state.get(node) === 'active') {
      const start = stack.indexOf(node);
      found.push(`cycle: ${[...stack.slice(start), node].join(' -> ')}`);
      return;
    }
    if (state.get(node) === 'done') return;
    state.set(node, 'active');
    stack.push(node);
    (graph.get(node) ?? []).forEach(visit);
    stack.pop();
    state.set(node, 'done');
  }
  graph.forEach((_, node) => visit(node));
  return found;
}
export function runBoundaryCheck(root = process.cwd()) {
  const files = sourceFiles(root);
  const known = new Set(files);
  const graph = new Map(files.map((file) => [file, []]));
  const errors = [];
  if (existsSync(join(root, 'src/app'))) errors.push('src/app: App Router routes are not allowed');
  for (const file of files) {
    for (const specifier of imports(readFileSync(file, 'utf8'))) {
      errors.push(...boundaryErrors(root, file, specifier));
      const target = resolveImport(file, specifier, root, known);
      if (target) graph.get(file).push(target);
    }
  }
  return { files: files.map((file) => relativePath(root, file)), errors: [...errors, ...cycles(graph)] };
}
function main() {
  const config = options(process.argv.slice(2));
  const report = runBoundaryCheck(config.root);
  if (config.json) console.log(JSON.stringify(report));
  else report.errors.forEach((error) => console.error(`FAIL ${error}`));
  process.exitCode = report.errors.length ? 1 : 0;
}
if (import.meta.url === `file://${process.argv[1]}`) main();
