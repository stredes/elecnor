export type ImportErrorResponse = {
  readonly status: 400 | 409 | 424 | 502 | 503;
  readonly body: { readonly error: string };
};
