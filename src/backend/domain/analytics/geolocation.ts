import { recoverRegion, resolveRegion } from "../geography/resolve-location";
import type { GeolocationData } from "./analytics-contract";
import type { AnalyticInspection } from "./series";

export function calculateGeolocation(items: readonly AnalyticInspection[]): GeolocationData {
  const totals = new Map<string, number>();
  let classified = 0;
  for (const item of items) {
    const stored = resolveRegion(null, item.region ?? null);
    const region = stored ?? recoverRegion(item.city ?? null, item.address ?? null, item.filename ?? null);
    if (!region) continue;
    classified += 1;
    totals.set(region, (totals.get(region) ?? 0) + 1);
  }
  const total = items.length;
  const percentage = total ? roundPercent(classified / total) : 0;
  return {
    total, con_geolocalizacion: classified, sin_geolocalizacion: total - classified,
    porcentaje_con_geolocalizacion: percentage, direcciones_clasificadas: classified,
    direcciones_pendientes: total - classified, porcentaje_direcciones_clasificadas: percentage,
    por_region: [...totals].map(([region, count]) => ({ region, total: count }))
      .sort((left, right) => right.total - left.total || left.region.localeCompare(right.region)),
  };
}

function roundPercent(value: number): number {
  return Math.round(value * 10000) / 100;
}
