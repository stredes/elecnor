import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { dashboardQuery } from "@/backend/composition/dashboard";
import { pageBackendError } from "@/backend/composition/page-error";
import { MetricsView } from "@/dashboard/views/MetricsView";
import type { MetricsViewProps } from "@/dashboard/contracts/metrics-view-contract";

export const getServerSideProps: GetServerSideProps<MetricsViewProps> = async () => {
  try {
    const snapshot = await dashboardQuery.execute();
    return { props: { snapshot, deferReport: true } };
  } catch (error) {
    return { props: { snapshot: null, error: pageBackendError(error, "métricas") } };
  }
};

export default function MetricsPage({
  snapshot,
  report,
  catalog,
  deferReport,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <MetricsView snapshot={snapshot} report={report} catalog={catalog} deferReport={deferReport} error={error} />;
}
