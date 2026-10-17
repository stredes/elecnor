import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { syntheticDashboardQuery } from "@/backend/composition/synthetic-dashboard";
import { syntheticReportingQuery } from "@/backend/composition/synthetic-reporting";
import { MetricsView } from "@/dashboard/views/MetricsView";
import { toLegacyDashboardModel } from "@/dashboard/contracts/legacy-dashboard-contract";

export const getServerSideProps: GetServerSideProps = async () => ({ props: { snapshot: await syntheticDashboardQuery.execute(), report: toLegacyDashboardModel(await syntheticReportingQuery.execute()) } });

export default function MetricsPage({
  snapshot,
  report,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <MetricsView snapshot={snapshot} report={report} />;
}
