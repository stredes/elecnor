import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { syntheticDashboardQuery } from "@/backend/composition/synthetic-dashboard";
import { syntheticReportingQuery } from "@/backend/composition/synthetic-reporting";
import { DashboardView } from "@/dashboard/views/DashboardView";
import { toLegacyDashboardModel } from "@/dashboard/contracts/legacy-dashboard-contract";

export const getServerSideProps: GetServerSideProps = async () => ({ props: { snapshot: await syntheticDashboardQuery.execute(), report: toLegacyDashboardModel(await syntheticReportingQuery.execute()) } });

export default function Home({ snapshot, report }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <DashboardView snapshot={snapshot} report={report} homeHref="/" />;
}
