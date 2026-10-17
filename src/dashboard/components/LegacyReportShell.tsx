import type { LegacyReportShellProps } from "../contracts/legacy-layout-contract";

export function LegacyReportShell({ id, index, title, lead, children }: LegacyReportShellProps) {
  return (
    <section id={id} className="legacy-report-section">
      <div className="legacy-section-heading">
        <span className="legacy-section-index">{index}</span>
        <h2>{title}</h2>
      </div>
      <p className="legacy-section-lead">{lead}</p>
      <div className="legacy-section-content">{children}</div>
    </section>
  );
}
