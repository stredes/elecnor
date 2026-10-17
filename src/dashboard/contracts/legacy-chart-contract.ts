export type DonutSlice = { readonly label: string; readonly value: number; readonly color?: string; readonly display?: string };
export type DonutArc = DonutSlice & { readonly dash: number; readonly offset: number };
