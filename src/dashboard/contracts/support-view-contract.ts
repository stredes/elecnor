import type { FindingResult } from "@/backend/domain/read-models/finding-contract";
import type { ImportLogResult } from "@/backend/domain/read-models/log-contract";
import type { UnknownMetricResult } from "@/backend/domain/read-models/unknown-contract";

export type FindingsViewProps = { readonly result: FindingResult; readonly error?: string };
export type UnknownsViewProps = { readonly result: UnknownMetricResult; readonly error?: string };
export type LogsViewProps = { readonly result: ImportLogResult; readonly error?: string };
