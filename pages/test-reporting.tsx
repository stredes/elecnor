import type { GetServerSideProps } from "next";
import { MemoryReportingDetailsReader } from "@/backend/adapters/outbound/memory-reporting-details-reader";
import type { ReportingDetailFacts } from "@/backend/domain/reporting/reporting-details-contract";
import { createReportingDetails } from "@/backend/composition/reporting-details";
import type { TestReportingPageProps } from "@/dashboard/contracts/test-reporting-page-contract";
import { ReportingInsights } from "@/dashboard/components/ReportingInsights";

const syntheticFacts: ReportingDetailFacts = {
  inspections: [{ id: "synthetic-e2e-1", technician: "Técnica sintética" }],
  metrics: [{ inspectionId: "synthetic-e2e-1", code: "METRIC-E2E", metric: "Protección visual",
    section: "Preparacion", applicable: 10, conforming: 7, state: "CONFORME", observation: null,
    date: "2026-01-01", technician: "Técnica sintética", notApplicable: 0 }],
};

export const getServerSideProps: GetServerSideProps<TestReportingPageProps> = async () => {
  if (process.env.NODE_ENV === "production") return { notFound: true };
  const reader = new MemoryReportingDetailsReader(syntheticFacts);
  return { props: { report: await createReportingDetails(reader).execute() } };
};

export default function TestReportingPage({ report }: TestReportingPageProps) {
  return <ReportingInsights report={report} />;
}
