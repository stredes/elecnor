import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { dashboardQuery } from "@/backend/composition/dashboard";
import { DashboardScreen } from "@/dashboard/components/DashboardScreen";

export const getServerSideProps: GetServerSideProps = async () => ({
  props: { snapshot: await dashboardQuery.execute() },
});

export default function DashboardPage({
  snapshot,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <DashboardScreen snapshot={snapshot} />;
}
