import { normalizeText } from "../import-normalization";
import { cityAliases, cityRegions } from "./city-data";
import { regionAliases } from "./region-data";

const STREET_PREFIXES = new Set(["c", "calle", "av", "avd", "avda", "avenida", "pje", "pasaje", "villa", "ruta", "camino"]);

export function extractCity(address: string | null): string | null {
  const text = normalizeText(address);
  if (!text) return null;
  const aliases = cityAliases.flatMap(([city, values]) => values.map((alias) => ({ city, alias })))
    .sort((left, right) => right.alias.length - left.alias.length);
  const candidates = aliases.flatMap((item) => {
    const match = new RegExp(`\\b${escape(item.alias)}\\b`, "u").exec(text);
    if (!match || streetSlot(text, match.index) || followedByNumber(text, match.index + item.alias.length)) return [];
    return [{ city: item.city, start: match.index, end: match.index + item.alias.length }];
  });
  if (!candidates.length) return null;
  const regionMatch = candidates.filter((item) => hasRegion(text.slice(item.end)));
  const selected = (regionMatch.length ? regionMatch : candidates)
    .sort((left, right) => right.end - right.start - (left.end - left.start) || left.start - right.start)[0];
  return selected.city;
}

export function resolveRegion(city: string | null, address: string | null): string | null {
  if (city && cityRegions[city]) return cityRegions[city];
  const text = normalizeText(address);
  const match = regionAliases
    .slice().sort((left, right) => right[0].length - left[0].length)
    .find(([alias]) => new RegExp(`(^| )${escape(alias)}($| )`, "u").test(text));
  return match?.[1] ?? null;
}

export function recoverRegion(
  city: string | null,
  address: string | null,
  filename: string | null,
): string | null {
  const fromAddress = resolveRegion(null, address);
  if (fromAddress) return fromAddress;
  const fromFields = resolveRegion(city ?? extractCity(address), address);
  if (fromFields) return fromFields;
  if (!filename) return null;
  const cleanName = filename.replaceAll("_", " ").replace(/\.[^.]+$/u, "");
  return resolveRegion(extractCity(cleanName), null);
}

function hasRegion(text: string): boolean {
  return regionAliases.some(([alias]) => text.trim().startsWith(alias));
}

function streetSlot(text: string, index: number): boolean {
  const previous = text.slice(0, index).trim().split(" ").pop();
  return previous ? STREET_PREFIXES.has(previous) : false;
}

function followedByNumber(text: string, position: number): boolean {
  return /\d/u.test(text.slice(position, position + 1));
}

function escape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
