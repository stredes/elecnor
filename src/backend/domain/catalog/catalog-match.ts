import type { CatalogMatch, MetricDefinition } from "./catalog-contract";
import { normalizeText } from "../import-normalization";
import { sequenceRatio } from "./sequence-ratio";

const MEDIA_TOKEN = /[\da-f]{8}[\s-]*[\da-f]{4}[\s-]*[\da-f]{4}[\s-]*[\da-f]{4}[\s-]*[\da-f]{12}\s*(?:mp4)?/giu;

export function matchMetric(
  value: string | null,
  definitions: readonly MetricDefinition[],
): CatalogMatch | null {
  const text = cleanMetricText(value);
  if (!text) return null;
  const keyword = keywordMatch(text, definitions);
  if (keyword) return keyword;
  const variants = definitions.flatMap((definition) => candidates(definition));
  const exact = variants.find((item) => item.text === text);
  if (exact) return toMatch(exact.definition, 1);
  const contained = variants.filter((item) => containsLongText(text, item.text));
  const codes = new Set(contained.map((item) => item.definition.code));
  if (contained.length && codes.size === 1) return toMatch(contained[0].definition, 0.94);
  const best = variants
    .map((item, index) => ({ item, score: sequenceRatio(text, item.text), index }))
    .sort((left, right) => right.score - left.score || left.index - right.index)[0];
  return best && best.score >= 0.88 ? toMatch(best.item.definition, best.score) : null;
}

function keywordMatch(text: string, definitions: readonly MetricDefinition[]): CatalogMatch | null {
  let best: CatalogMatch | null = null;
  for (const definition of definitions) for (const keyword of definition.keywords) {
    const normalized = normalizeText(keyword);
    if (!normalized || !text.includes(normalized)) continue;
    const confidence = Math.min(1, normalized.length / text.length * 1.35 + 0.15);
    if (!best || confidence > best.confidence) best = toMatch(definition, confidence);
  }
  return best;
}

function candidates(definition: MetricDefinition) {
  const values = [definition.name, ...definition.keywords, ...(definition.variants ?? [])];
  return values.map((value) => ({ definition, text: normalizeText(value) })).filter((item) => item.text);
}

function containsLongText(left: string, right: string): boolean {
  return Math.min(left.length, right.length) >= 10 && (left.includes(right) || right.includes(left));
}

function cleanMetricText(value: string | null): string {
  const text = normalizeText(value).replace(MEDIA_TOKEN, " ").trim();
  return text.startsWith("tecnico ") ? text.slice("tecnico ".length) : text;
}

function toMatch(definition: MetricDefinition, confidence: number): CatalogMatch {
  return { code: definition.code, name: definition.name, section: definition.section, confidence };
}
