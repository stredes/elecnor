import type { BackendFailureCode } from "./http-errors-contract";

export type { BackendFailureCode } from "./http-errors-contract";

export class BackendAdapterError extends Error {
  public constructor(
    public readonly code: BackendFailureCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "BackendAdapterError";
  }
}

export class BackendConfigurationError extends BackendAdapterError {
  public constructor(message: string) {
    super("CONFIGURATION", message);
    this.name = "BackendConfigurationError";
  }
}

export function failureForStatus(status: number): Exclude<BackendFailureCode, "CONFIGURATION"> {
  if (status === 409) return "CONFLICT";
  if (status === 424) return "FAILED_DEPENDENCY";
  if (status === 404) return "NOT_FOUND";
  if (status === 408 || status === 504) return "TIMEOUT";
  return status >= 500 ? "UNAVAILABLE" : "REJECTED";
}
