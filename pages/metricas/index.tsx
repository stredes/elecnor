import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { dashboardQuery } from "@/backend/composition/dashboard";
import { pageBackendError } from "@/backend/composition/page-error";
import { MetricsView } from "@/dashboard/views/MetricsView";
import type { MetricsViewProps } from "@/dashboard/contracts/metrics-view-contract";
import { metricsReader } from "@/backend/composition/read-models";

export const getServerSideProps: GetServerSideProps<MetricsViewProps> = async () => {
  let failure: unknown;
  const attempt = async <T,>(query: Promise<T>): Promise<T | null> => { try { return await query; } catch (error) { failure ??= error; return null; } };
  const [snapshot, catalog] = await Promise.all([attempt(dashboardQuery.execute()), attempt(metricsReader.list())]);
  const error = !snapshot && !catalog && failure ? pageBackendError(failure, "métricas") : undefined;
  return { props: { snapshot, catalog: catalog ?? undefined, deferReport: true, error } };
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
