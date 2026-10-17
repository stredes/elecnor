import type { DonutArc, DonutSlice } from "../contracts/legacy-chart-contract";

export function LegacyDonutChart({ title, label, slices }: { readonly title: string; readonly label: string; readonly slices: readonly DonutSlice[] }) {
  const visible = slices.filter((slice) => slice.value > 0);
  const total = visible.reduce((sum, slice) => sum + slice.value, 0);
  const circumference = 2 * Math.PI * 78;
  const arcs = visible.reduce<DonutArc[]>((result, slice) => {
    const previous = result.reduce((sum, arc) => sum + arc.dash, 0);
    const dash = total ? slice.value / total * circumference : 0;
    return [...result, { ...slice, dash, offset: -previous }];
  }, []);
  return <div className="legacy-donut"><svg viewBox="0 0 220 220" role="img" aria-label={label}><title>{title}</title><g transform="rotate(-90 110 110)"><circle cx="110" cy="110" r="78" fill="none" stroke="var(--hc-borde)" strokeWidth="34" />{arcs.map((arc) => <circle key={arc.label} cx="110" cy="110" r="78" fill="none" stroke={arc.color ?? "var(--hc-azul)"} strokeWidth="34" strokeDasharray={`${Math.max(0, arc.dash - 2)} ${circumference}`} strokeDashoffset={arc.offset} />)}</g></svg><ul>{slices.map((slice) => <li key={slice.label}><i style={{ backgroundColor: slice.color ?? "var(--hc-azul)" }} /><span>{slice.label}</span><strong>{slice.display ?? slice.value}</strong></li>)}</ul></div>;
}
