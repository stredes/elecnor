import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { dashboardQuery } from "@/backend/composition/dashboard";
import { pageBackendError } from "@/backend/composition/page-error";
import { DashboardScreen } from "@/dashboard/components/DashboardScreen";
import type { DashboardScreenProps } from "@/dashboard/contracts/dashboard-screen-contract";

export const getServerSideProps: GetServerSideProps<DashboardScreenProps> = async () => {
  try {
    const snapshot = await dashboardQuery.execute();
    return { props: { snapshot, deferReport: true } };
  } catch (error) {
    return { props: { snapshot: null, error: pageBackendError(error, "dashboard") } };
  }
};

export default function DashboardPage({
  snapshot,
  report,
  deferReport,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <DashboardScreen snapshot={snapshot} report={report} deferReport={deferReport} error={error} />;
}
