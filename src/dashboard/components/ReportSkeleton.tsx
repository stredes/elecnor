import type { ReportSkeletonProps } from "../contracts/report-skeleton-contract";

export function ReportSkeleton({ variant }: ReportSkeletonProps) {
  return (
    <section className={`report-skeleton report-skeleton-${variant}`} data-testid={`${variant}-report-skeleton`} aria-busy="true" aria-label="Cargando información">
      <span className="visually-hidden">Cargando información del reporte.</span>
      <div className="skeleton-line skeleton-title" aria-hidden="true" />
      <div className="skeleton-line skeleton-copy" aria-hidden="true" />
      <div className="skeleton-grid" aria-hidden="true">
        <span className="skeleton-card" /><span className="skeleton-card" /><span className="skeleton-card" />
      </div>
      <div className="skeleton-panel" aria-hidden="true"><span /><span /><span /><span /></div>
    </section>
  );
}
