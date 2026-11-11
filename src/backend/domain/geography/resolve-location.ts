import { normalizeText } from "../import-normalization";
import { cityAliases, cityRegions } from "./city-data";
import { regionAliases } from "./region-data";

const STREET_PREFIXES = new Set(["c", "calle", "av", "avd", "avda", "avenida", "pje", "pasaje", "villa", "ruta", "camino"]);
const FILENAME_HINTS: readonly (readonly [RegExp, string])[] = [
  [/^075_5c8fbed181264770ae06aeed1531efb9$/u, "Maule"],
];
const ADDRESS_HINTS: readonly (readonly [RegExp, string])[] = [
  // Ubicaciones recuperadas desde las direcciones de los documentos que no
  // traían comuna/región en los campos estructurados de Mitti.
  [/\bpje mercedes\s*4555\b/u, "Región Metropolitana"],
  [/\bav las nieves\s*780\b/u, "O'Higgins"],
  [/\bpje lago sarmiento\s*0456\b/u, "O'Higgins"],
  [/\bel trapiche\s*3152\b/u, "O'Higgins"],
  [/\bemma jauch jelves\s*1429\b/u, "Maule"],
  [/\bpasaje jimenez\s*22\b/u, "Valparaíso"],
  [/\bagustin avezon\s*99\b/u, "Valparaíso"],
  [/\bla parva\s*684\b/u, "Valparaíso"],
  [/\b29 y media sur\s*1303\b/u, "Maule"],
  [/\bdoce y medio sur\s*3744\b/u, "Maule"],
  [/\bveintidos norte\s*3960\b/u, "Valparaíso"],
  [/\b27 y media (?:oriente|otiente)\s*63\b/u, "Maule"],
  [/\bvalle de elicura\s*0280\b/u, "O'Higgins"],
  [/\bcamino a tuniche\s*2781\b/u, "O'Higgins"],
  [/\b\d+\s*(?:sur|norte|oriente|ote|otiente)\b/u, "Maule"],
  [/\blos corregidores\b/u, "Ñuble"], [/\breloncavi\b/u, "Ñuble"],
  [/\bpasaje tres las violetas\b/u, "Maule"], [/\b23\s*n(?:te|orte)\b/u, "Maule"],
  [/\(-35\.409009,\s*-71\.6258038\)/u, "Maule"],
];

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
  const hint = ADDRESS_HINTS.find(([pattern]) => pattern.test(text) || pattern.test(address ?? ""));
  if (hint) return hint[1];
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
  return resolveRegion(extractCity(cleanName), null) ?? filenameRegion(filename);
}

export function resolveInspectionRegion(
  region: string | null,
  city: string | null,
  address: string | null,
  filename: string | null,
): string | null {
  return resolveRegion(null, region) ?? recoverRegion(city, address, filename);
}

function filenameRegion(filename: string): string | null {
  const cleanName = filename.replace(/\.[^.]+$/u, "");
  return FILENAME_HINTS.find(([pattern]) => pattern.test(cleanName))?.[1] ?? null;
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
