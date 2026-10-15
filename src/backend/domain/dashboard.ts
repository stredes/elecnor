export type DashboardStatus = "healthy" | "degraded";

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  trend: string;
};

export type DashboardSnapshot = {
  status: DashboardStatus;
  generatedAt: string;
  metrics: DashboardMetric[];
};

export function createDashboardSnapshot(
  metrics: DashboardMetric[],
  generatedAt: string,
  status: DashboardStatus = "healthy",
): DashboardSnapshot {
  return { status, generatedAt, metrics: [...metrics] };
}

export function parseDashboardSnapshot(value: unknown): DashboardSnapshot {
  if (!isSnapshot(value)) throw new Error("Invalid dashboard snapshot");
  return value;
}

function isSnapshot(value: unknown): value is DashboardSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<DashboardSnapshot>;
  return (
    (snapshot.status === "healthy" || snapshot.status === "degraded") &&
    typeof snapshot.generatedAt === "string" &&
    Array.isArray(snapshot.metrics) &&
    snapshot.metrics.every(isMetric)
  );
}

function isMetric(value: unknown): value is DashboardMetric {
  if (!value || typeof value !== "object") return false;
  const metric = value as Partial<DashboardMetric>;
  return [metric.id, metric.label, metric.value, metric.trend].every(
    (field) => typeof field === "string",
  );
}
