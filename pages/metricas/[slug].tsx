import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { syntheticMetricDetailQuery, syntheticReportingQuery } from "@/backend/composition/synthetic-reporting";
import { LegacyMetricDetailView, LegacyObservedEppView } from "@/dashboard/components/LegacyMetricDetailView";
import { toLegacyDashboardModel } from "@/dashboard/contracts/legacy-dashboard-contract";
import type { MetricDetailPageProps } from "@/dashboard/contracts/metric-detail-page-contract";
import type { LegacyMetricDetail } from "@/dashboard/contracts/legacy-metric-detail-contract";
import { ReportLayout } from "@/dashboard/components/ReportLayout";

export const getServerSideProps: GetServerSideProps<MetricDetailPageProps> = async ({ params }) => {
  const slug = typeof params?.slug === "string" ? decodeURIComponent(params.slug) : "";
  if (slug === "epp-observado") {
    const payload = await syntheticReportingQuery.execute();
    return { props: { detail: null, observed: toLegacyDashboardModel(payload) } };
  }
  const detail = await syntheticMetricDetailQuery.execute(slug) as LegacyMetricDetail | null;
  return detail ? { props: { detail, observed: null } } : { notFound: true };
};

export default function MetricDetailPage({ detail, observed }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <ReportLayout activeRoute="metrics" homeHref="/"><>{detail ? <LegacyMetricDetailView detail={detail} /> : observed ? <LegacyObservedEppView model={observed} /> : null}</></ReportLayout>;
}
