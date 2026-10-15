export type ImportErrorResponse = {
  readonly status: 400 | 502 | 503;
  readonly body: { readonly error: string };
};
