import type { ReportingFacts } from "./reporting-facts-contract";
import type {
  SectionApprovalReport,
  SectionReport,
} from "./reporting-section-contract";
import type { MetricRanking } from "./reporting-metric-contract";
import type { NarrativeSummary } from "./reporting-narrative-contract";

export type ReportingDetails = {
  readonly sections: readonly SectionReport[];
  readonly sectionInspections: SectionApprovalReport;
  readonly metrics: MetricRanking;
  readonly narrative: NarrativeSummary;
};

export type ReportingDetailFacts = ReportingFacts;
