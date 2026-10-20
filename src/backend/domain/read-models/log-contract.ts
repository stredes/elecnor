export type ImportLog = {
  readonly id: string;
  readonly datetime: string;
  readonly type: string;
  readonly file: string | null;
  readonly inspectionId: string | null;
  readonly result: string;
  readonly message: string;
  readonly duration: number;
};

export type ImportLogResult = { readonly count: number; readonly data: readonly ImportLog[] };
