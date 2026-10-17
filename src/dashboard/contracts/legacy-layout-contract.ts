import type { ReactNode } from "react";

export type LegacyReportShellProps = { readonly id?: string; readonly index: string; readonly title: string; readonly lead: string; readonly children: ReactNode };
export type LegacyReadingGuideProps = { readonly title: string; readonly how: string; readonly reveals: string };
export type LegacyCoverageRegion = { readonly key: string; readonly name: string; readonly aliases: readonly string[]; readonly x: number; readonly y: number; readonly labelY: number };
