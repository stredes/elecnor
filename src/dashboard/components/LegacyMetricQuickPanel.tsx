import Link from "next/link";
import { useEffect, useRef } from "react";
import type { LegacyMetric } from "../contracts/legacy-dashboard-contract";

export function LegacyMetricQuickPanel({ metric, onClose }: { readonly metric: LegacyMetric | null; readonly onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!metric) return undefined;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("keydown", escape); opener?.focus(); };
  }, [metric, onClose]);
  if (!metric) return null;
  return <div className="legacy-modal-backdrop" onClick={onClose} data-testid="metric-quick-backdrop"><section className="legacy-modal" role="dialog" aria-modal="true" aria-label={`Detalle de ${metric.metric}`} onClick={(event) => event.stopPropagation()}><div className="legacy-modal-heading"><div><h2>{metric.metric}</h2><p>{metric.section} · <code>{metric.code}</code></p></div><button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar detalle de métrica">×</button></div><div className="legacy-modal-kpis"><span>Aplicables<strong>{metric.applicable}</strong></span><span>Conformes<strong>{metric.conforming}</strong></span><span>No conformes<strong>{metric.nonConforming}</strong></span><span>Cumplimiento<strong>{formatPercentage(metric.compliance)}</strong></span></div><Link href={`/metricas/${encodeURIComponent(metric.code)}`} className="legacy-detail-link">Ver desglose completo →</Link></section></div>;
}

function formatPercentage(value: number | null): string { return value === null ? "—" : `${value.toFixed(2)}%`; }
