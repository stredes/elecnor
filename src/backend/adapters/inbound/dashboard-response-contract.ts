import type { DashboardSnapshot } from "../../domain/dashboard";

export type DashboardErrorCode = "BACKEND_UNAVAILABLE" | "BACKEND_CONFIGURATION" | "BACKEND_REJECTED" | "BACKEND_INVALID_RESPONSE" | "BACKEND_CONFLICT" | "BACKEND_FAILED_DEPENDENCY" | "BACKEND_NOT_FOUND" | "BACKEND_TIMEOUT" | "METHOD_NOT_ALLOWED";

export type DashboardErrorResponse = { code: DashboardErrorCode };

export type DashboardResponse = DashboardSnapshot | DashboardErrorResponse;
