import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { inspectionDetailQuery } from "@/backend/composition/inspections";
import { pageBackendError } from "@/backend/composition/page-error";
import { InspectionDetailView } from "@/inspections/views/InspectionDetailView";
import type { InspectionDetailViewProps } from "@/inspections/contracts/inspection-detail-view-contract";

export const getServerSideProps: GetServerSideProps<InspectionDetailViewProps> = async ({ params }) => {
  const id = typeof params?.id === "string" ? params.id : "";
  if (!id) return { notFound: true };
  try {
    const detail = await inspectionDetailQuery.execute(id);
    return detail ? { props: { detail, downloadHref: inspectionDownloadHref(detail.inspection.id) } } : { notFound: true };
  } catch (error) {
    return { props: { detail: null, error: pageBackendError(error, "detalle de inspección") } };
  }
};

export default function InspectionDetailPage({ detail, downloadHref }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <InspectionDetailView detail={detail} downloadHref={downloadHref} />;
}

function inspectionDownloadHref(id: string): string {
  return `/api/inspections/${encodeURIComponent(id)}/download`;
}
