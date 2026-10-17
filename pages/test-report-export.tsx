import type { GetServerSideProps } from "next";
import { MemoryReportingFactsReader } from "@/backend/adapters/outbound/memory-reporting-facts-reader";
import { MemoryReportingDetailsReader } from "@/backend/adapters/outbound/memory-reporting-details-reader";
import { MemoryReportRenderer } from "@/backend/adapters/outbound/memory-report-renderer";
import { GetDashboardOverview } from "@/backend/application/reporting/get-dashboard-overview";
import { GetReportingDetails } from "@/backend/application/reporting/get-reporting-details";
import { buildReportSnapshot } from "@/backend/application/reporting/build-report-snapshot";
import { ExportReport } from "@/backend/application/reporting/export-report";
import type { TestReportExportProps } from "@/dashboard/contracts/test-report-export-contract";

const facts = { inspections: [], importLogs: [], metrics: [] };

export const getServerSideProps: GetServerSideProps<TestReportExportProps> = async () => {
  if (process.env.NODE_ENV === "production") return { notFound: true };
  const overview = await new GetDashboardOverview(new MemoryReportingFactsReader(facts)).execute();
  const details = await new GetReportingDetails(new MemoryReportingDetailsReader({ inspections: [], metrics: [] })).execute();
  const snapshot = buildReportSnapshot(overview, details);
  const renderer = new MemoryReportRenderer([{ type: "text", value: "=SUM(A1)" }]);
  const result = await new ExportReport({ read: async () => snapshot }, renderer).execute();
  return { props: { cells: result.sheets.flatMap((sheet) => [...sheet.cells]) } };
};

export default function TestReportExport({ cells }: TestReportExportProps) {
  return <main><section aria-label="Vista sintética de exportación"><table><tbody>
    {cells.map((cell, index) => <tr key={index}><td data-cell-type={cell.type}>{cell.value ?? ""}</td></tr>)}
  </tbody></table></section></main>;
}
