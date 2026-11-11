import { useState } from "react";
import { scoreBandLevelLabel, scoreBandStateClass } from "@/backend/domain/reporting/exigency-scale";
import type { DonutArc, DonutSlice } from "../contracts/legacy-chart-contract";
import { LegacyChartTooltip } from "./LegacyChartTooltip";

type DonutLegendMode = "none" | "compliance" | "distribution";

type LegacyDonutChartProps = {
  readonly title: string;
  readonly label: string;
  readonly slices: readonly DonutSlice[];
  readonly legendMode?: DonutLegendMode;
};

export function LegacyDonutChart({ title, label, slices, legendMode = "none" }: LegacyDonutChartProps) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const visible = slices.filter((slice) => slice.value > 0);
  const total = visible.reduce((sum, slice) => sum + slice.value, 0);
  const circumference = 2 * Math.PI * 78;
  const arcs = visible.reduce<DonutArc[]>((result, slice) => {
    const previous = result.reduce((sum, arc) => sum + arc.dash, 0);
    const dash = total ? slice.value / total * circumference : 0;
    return [...result, { ...slice, dash, offset: -previous }];
  }, []);
  const activeSlice = visible.find((slice) => slice.label === activeLabel) ?? null;
  return <div className="legacy-donut"><div className="legacy-donut-visual hc-donut-spin"><svg viewBox="0 0 220 220" role="img" aria-label={label}><title>{title}</title><g transform="rotate(-90 110 110)"><circle cx="110" cy="110" r="78" fill="none" stroke="var(--hc-borde)" strokeWidth="34" />{arcs.map((arc) => <circle className={`legacy-donut-arc${activeLabel === arc.label ? " is-active" : ""}`} key={arc.label} cx="110" cy="110" r="78" fill="none" stroke={arc.color ?? "var(--hc-azul)"} strokeWidth="34" strokeDasharray={`${Math.max(0, arc.dash - 2)} ${circumference}`} strokeDashoffset={arc.offset} tabIndex={0} role="img" aria-label={donutAriaLabel(arc, total)} onMouseEnter={() => setActiveLabel(arc.label)} onMouseLeave={() => setActiveLabel(null)} onFocus={() => setActiveLabel(arc.label)} onBlur={() => setActiveLabel(null)}><title>{donutAriaLabel(arc, total)}</title></circle>)}</g></svg>{activeSlice && <LegacyChartTooltip label={activeSlice.label} value={activeSlice.display ?? activeSlice.value.toLocaleString("es-CL")} detail={`${formatPercentage(activeSlice.value, total)} del total`} />}</div><div className="legacy-donut-legend">{legendHeader(legendMode)}<ul>{slices.map((slice, index) => <DistributionRow key={slice.label} slice={slice} index={index} legendMode={legendMode} total={total} />)}</ul></div></div>;
}

function DistributionRow({ slice, index, legendMode, total }: { readonly slice: DonutSlice; readonly index: number; readonly legendMode: DonutLegendMode; readonly total: number }) {
  const isDistribution = legendMode === "distribution";
  const state = isDistribution && isScoreBand(slice.label) ? scoreBandStateClass(slice.label) : "";
  return <li className={`hc-donut-data-enter${isDistribution ? " legacy-donut-distribution-row" : ""} ${state}`} style={{ animationDelay: `${180 + index * 120}ms` }}><i style={{ backgroundColor: slice.color ?? "var(--hc-azul)" }} />{isDistribution && isScoreBand(slice.label) ? <span className="legacy-donut-score"><strong>{formatBand(slice.label)}</strong><small>{scoreBandLevelLabel(slice.label)}</small></span> : <span>{slice.label}</span>}{isDistribution ? <><strong>{formatPercentage(slice.value, total)}</strong><strong>{slice.value.toLocaleString("es-CL")}</strong></> : <strong>{slice.display ?? slice.value}</strong>}</li>;
}

function donutAriaLabel(slice: DonutSlice, total: number): string {
  return `${slice.label}: ${slice.display ?? slice.value.toLocaleString("es-CL")}, ${formatPercentage(slice.value, total)} del total`;
}

function legendHeader(mode: DonutLegendMode) {
  if (mode === "distribution") return <div className="legacy-donut-legend-header legacy-donut-legend-header-distribution"><span>Puntaje / nivel</span><span>% del total</span><span>Cantidad</span></div>;
  if (mode === "compliance") return <div className="legacy-donut-legend-header"><span>Nombre</span><span>% de cumplimiento</span></div>;
  return null;
}

function isScoreBand(label: string): label is Parameters<typeof scoreBandStateClass>[0] {
  return ["0-49", "50-59", "60-69", "70-79", "80-89", "90-99", "100"].includes(label);
}

function formatBand(label: Parameters<typeof scoreBandStateClass>[0]): string {
  return label === "100" ? "100%" : `${label}%`;
}

function formatPercentage(value: number, total: number): string {
  return `${total ? (value / total * 100).toFixed(1) : "0.0"}%`;
}
