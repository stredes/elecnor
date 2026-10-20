import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { metricDetailQuery, reportingViewQuery } from "@/backend/composition/reporting-view";
import { pageBackendError } from "@/backend/composition/page-error";
import { LegacyMetricDetailView, LegacyObservedEppView } from "@/dashboard/components/LegacyMetricDetailView";
import { toLegacyDashboardModel } from "@/dashboard/contracts/legacy-dashboard-contract";
import type { MetricDetailPageProps } from "@/dashboard/contracts/metric-detail-page-contract";
import type { LegacyMetricDetail } from "@/dashboard/contracts/legacy-metric-detail-contract";
import { ReportLayout } from "@/dashboard/components/ReportLayout";

export const getServerSideProps: GetServerSideProps<MetricDetailPageProps> = async ({ params }) => {
  const slug = typeof params?.slug === "string" ? decodeURIComponent(params.slug) : "";
  try {
    if (slug === "epp-observado") {
      const payload = await reportingViewQuery.execute();
      return { props: { detail: null, observed: toLegacyDashboardModel(payload) } };
    }
    const detail = await metricDetailQuery.execute(slug) as LegacyMetricDetail | null;
    return detail ? { props: { detail, observed: null } } : { notFound: true };
  } catch (error) {
    return { props: { detail: null, observed: null, error: pageBackendError(error, "detalle de métricas") } };
  }
};

export default function MetricDetailPage({ detail, observed, error }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <ReportLayout activeRoute="metrics" homeHref="/"><>{error ? <p role="alert">{error}</p> : detail ? <LegacyMetricDetailView detail={detail} /> : observed ? <LegacyObservedEppView model={observed} /> : null}</></ReportLayout>;
}
