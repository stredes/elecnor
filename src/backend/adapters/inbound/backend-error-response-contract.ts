export type BackendErrorBody = {
  readonly error: string;
  readonly code: "BACKEND_UNAVAILABLE" | "BACKEND_CONFIGURATION" | "BACKEND_REJECTED"
    | "BACKEND_INVALID_RESPONSE" | "BACKEND_CONFLICT" | "BACKEND_FAILED_DEPENDENCY"
    | "BACKEND_NOT_FOUND" | "BACKEND_TIMEOUT";
};

export type BackendErrorResult = {
  readonly status: 404 | 409 | 424 | 502 | 503 | 504;
  readonly body: BackendErrorBody;
};
