export type ProcedureDescriptionBlock =
  | { readonly type: "paragraph"; readonly text: string }
  | { readonly type: "list"; readonly items: readonly string[] };

export type ProcedureDescriptionSection = {
  readonly heading: string | null;
  readonly blocks: readonly ProcedureDescriptionBlock[];
};
