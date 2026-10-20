export type Finding = {
  readonly id: string;
  readonly inspectionId: string;
  readonly date: string | null;
  readonly section: string | null;
  readonly metric: string;
  readonly response: string | null;
  readonly observation: string | null;
  readonly actionStatus: string;
};

export type FindingResult = { readonly count: number; readonly data: readonly Finding[] };
