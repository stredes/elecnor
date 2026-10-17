import type { LegacyDashboardModel } from "../contracts/legacy-dashboard-contract";
import type { LegacyCoverageRegion } from "../contracts/legacy-layout-contract";

const regions: readonly LegacyCoverageRegion[] = [
  { key: "arica", name: "Arica y Parinacota", aliases: ["arica"], x: 526, y: 61, labelY: 62 }, { key: "tarapaca", name: "Tarapacá", aliases: ["tarapaca"], x: 531, y: 98, labelY: 99 },
  { key: "antofagasta", name: "Antofagasta", aliases: ["antofagasta"], x: 540, y: 162, labelY: 158 }, { key: "atacama", name: "Atacama", aliases: ["atacama"], x: 522, y: 244, labelY: 244 },
  { key: "coquimbo", name: "Coquimbo", aliases: ["coquimbo"], x: 506, y: 308, labelY: 308 }, { key: "valparaiso", name: "Valparaíso", aliases: ["valparaiso"], x: 502, y: 357, labelY: 342 },
  { key: "metropolitana", name: "Región Metropolitana", aliases: ["metropolitana", "santiago"], x: 507, y: 372, labelY: 370 }, { key: "ohiggins", name: "O'Higgins", aliases: ["ohiggins", "bernardo"], x: 501, y: 391, labelY: 397 },
  { key: "maule", name: "Maule", aliases: ["maule"], x: 491, y: 417, labelY: 423 }, { key: "nuble", name: "Ñuble", aliases: ["nuble"], x: 484, y: 439, labelY: 445 },
  { key: "biobio", name: "Biobío", aliases: ["biobio"], x: 478, y: 458, labelY: 466 }, { key: "araucania", name: "La Araucanía", aliases: ["araucania"], x: 476, y: 486, labelY: 490 },
  { key: "los-rios", name: "Los Ríos", aliases: ["los rios"], x: 471, y: 519, labelY: 520 }, { key: "los-lagos", name: "Los Lagos", aliases: ["los lagos"], x: 465, y: 570, labelY: 570 },
  { key: "aisen", name: "Aysén", aliases: ["aisen", "aysen"], x: 458, y: 681, labelY: 665 }, { key: "magallanes", name: "Magallanes", aliases: ["magallanes"], x: 501, y: 846, labelY: 850 },
];

export function LegacyCoverageMap({ data }: { readonly data: LegacyDashboardModel["geolocalizacion"] }) {
  const values = regions.map((region) => ({ ...region, total: findTotal(region, data.por_region) }));
  const maxTotal = Math.max(1, ...values.map((region) => region.total));
  return <div className="legacy-coverage-grid"><div className="legacy-map-wrap"><svg viewBox="380 20 380 960" role="img" aria-labelledby="legacy-map-title legacy-map-description"><title id="legacy-map-title">Inspecciones por región de Chile</title><desc id="legacy-map-description">Mapa completo de Chile con el número de inspecciones y el nombre de cada región disponible.</desc><image href="/chile-regions.svg" x="0" y="0" width="1000" height="1000" preserveAspectRatio="none" />{values.map((region) => { const radius = 10 + region.total / maxTotal * 13; return <a key={region.key} href={`/inspecciones?region=${encodeURIComponent(region.name)}`} aria-label={`${region.name}: ${region.total} inspecciones`}><line x1={region.x} y1={region.y} x2="615" y2={region.labelY} stroke="#94d1d6" strokeWidth="1.5" /><ellipse cx={region.x + 3} cy={region.y + 6} rx={radius + 2} ry={radius * .45} fill="#132a63" opacity=".26" /><circle cx={region.x} cy={region.y + 4} r={radius} fill="#142d70" opacity=".85" /><circle cx={region.x} cy={region.y} r={radius} fill="#3162de" stroke="#fff" strokeWidth="2" /><circle cx={region.x - radius * .3} cy={region.y - radius * .3} r={radius * .25} fill="#fff" opacity=".65" /><text x={region.x} y={region.y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">{region.total}</text><text x="620" y={region.labelY + 4} fontSize="11" fontWeight="600" fill="#1b2a4a">{region.name}</text><title>{`${region.name}: ${region.total} inspecciones`}</title></a>; })}</svg></div><div className="legacy-region-list"><p>Cobertura regional</p><span>Selecciona una región para ver sus inspecciones.</span><ul>{values.map((region) => <li key={region.key}><a href={`/inspecciones?region=${encodeURIComponent(region.name)}`}>{region.name}</a><b>{region.total.toLocaleString("es-CL")}</b></li>)}</ul><small>Cartografía regional: SimpleMaps, adaptada para esta visualización.</small></div></div>;
}

function findTotal(region: LegacyCoverageRegion, source: readonly { readonly region: string; readonly total: number }[]): number {
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const match = source.find((item) => region.aliases.some((alias) => normalize(item.region).includes(normalize(alias))));
  return match?.total ?? 0;
}
