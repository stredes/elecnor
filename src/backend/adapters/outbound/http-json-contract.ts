export type HttpClientOptions = {
  readonly contractVersion?: string;
  readonly timeoutMs?: number;
  readonly internalToken?: string | null;
  readonly downloadAssertion?: string;
  readonly requiredScope?: "official";
  readonly scope?: "official" | "all" | "inspections";
};
