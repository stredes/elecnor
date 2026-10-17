import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { syntheticDashboardQuery } from "@/backend/composition/synthetic-dashboard";
import { MetricsView } from "@/dashboard/views/MetricsView";

export const getServerSideProps: GetServerSideProps = async () => ({
  props: { snapshot: await syntheticDashboardQuery.execute() },
});

export default function MetricsPage({
  snapshot,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <MetricsView snapshot={snapshot} />;
}
