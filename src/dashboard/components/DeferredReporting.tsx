"use client";

import { useEffect, useState } from "react";
import type { DeferredReportingProps } from "../contracts/deferred-reporting-contract";
import type { LegacyDashboardModel } from "../contracts/legacy-dashboard-contract";

export function DeferredReporting({ endpoint = "/api/reporting", initial, fallback, errorFallback, children }: DeferredReportingProps) {
  const [report, setReport] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) return;
    const controller = new AbortController();
    fetch(endpoint, { method: "GET", headers: { accept: "application/json" }, signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("No fue posible cargar el reporte.");
        return response.json() as Promise<LegacyDashboardModel>;
      })
      .then(setReport)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "No fue posible cargar el reporte.");
      });
    return () => controller.abort();
  }, [endpoint, initial]);

  if (report) return <>{children(report)}</>;
  if (error && errorFallback) return <>{errorFallback(error)}</>;
  return <>{fallback}</>;
}
