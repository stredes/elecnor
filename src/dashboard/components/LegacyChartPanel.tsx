import type { ReactNode } from "react";

export function LegacyChartPanel({ eyebrow, title, copy, action, children }: { readonly eyebrow: string; readonly title: string; readonly copy: string; readonly action?: ReactNode; readonly children: ReactNode }) {
  return <article className="legacy-chart-panel legacy-glass-surface"><p className="legacy-chart-eyebrow">{eyebrow}</p><h3>{title}</h3><p className="legacy-chart-copy">{copy}</p><div className="legacy-chart-content">{children}</div>{action && <div className="legacy-chart-action">{action}</div>}</article>;
}
