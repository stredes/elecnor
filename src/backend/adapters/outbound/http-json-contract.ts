export type HttpClientOptions = {
  readonly contractVersion?: string;
  readonly timeoutMs?: number;
  readonly internalToken?: string | null;
  readonly requiredScope?: "official";
  readonly scope?: "official" | "all";
};
