import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { dashboardQuery } from "@/backend/composition/dashboard";
import { pageBackendError } from "@/backend/composition/page-error";
import { DashboardView } from "@/dashboard/views/DashboardView";
import type { DashboardViewProps } from "@/dashboard/contracts/dashboard-view-contract";

export const getServerSideProps: GetServerSideProps<DashboardViewProps> = async () => {
  try {
    const snapshot = await dashboardQuery.execute();
    return { props: { snapshot, deferReport: true, homeHref: "/" } };
  } catch (error) {
    return { props: { snapshot: null, error: pageBackendError(error, "dashboard"), homeHref: "/" } };
  }
};

export default function Home({ snapshot, report, deferReport, error }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <DashboardView snapshot={snapshot} report={report} deferReport={deferReport} error={error} homeHref="/" />;
}
