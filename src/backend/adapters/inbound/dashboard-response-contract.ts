import type { DashboardSnapshot } from "../../domain/dashboard";

export type DashboardErrorCode = "BACKEND_UNAVAILABLE" | "METHOD_NOT_ALLOWED";

export type DashboardErrorResponse = { code: DashboardErrorCode };

export type DashboardResponse = DashboardSnapshot | DashboardErrorResponse;
