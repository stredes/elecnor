export const CHILE_INSPECTION_REGIONS = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Región Metropolitana",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes",
] as const;

const ADDRESS_SEARCH_TERMS: Readonly<Record<string, string>> = {
  "arica y parinacota": "Arica",
  "tarapaca": "Tarapacá",
  antofagasta: "Antofagasta",
  atacama: "Atacama",
  coquimbo: "Coquimbo",
  valparaiso: "Valparaíso",
  "region metropolitana": "Metropolitana",
  ohiggins: "O'Higgins",
  maule: "Maule",
  nuble: "Ñuble",
  biobio: "Bío",
  "la araucania": "Araucanía",
  "los rios": "Los Ríos",
  "los lagos": "Los Lagos",
  aysen: "Aysén",
  magallanes: "Magallanes",
};

export function regionAddressSearchTerm(region: string): string {
  return ADDRESS_SEARCH_TERMS[normalize(region)] ?? region;
}

export function availableInspectionRegions(regions: readonly string[]): readonly string[] {
  return [...new Set([...CHILE_INSPECTION_REGIONS, ...regions])];
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
