import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { procedureReader } from "@/backend/composition/procedures";
import { pageBackendError } from "@/backend/composition/page-error";
import { ProcedureDetailView } from "@/procedures/views/ProcedureDetailView";
import type { ProcedureDetailViewProps } from "@/procedures/contracts/procedure-detail-view-contract";

export const getServerSideProps: GetServerSideProps<ProcedureDetailViewProps> = async ({ params }) => {
  const id = typeof params?.id === "string" ? params.id : "";
  if (!id) return { notFound: true };
  try {
    const detail = await procedureReader.detail(id);
    return detail ? { props: { detail, downloadHref: procedureDownloadHref(id) } } : { notFound: true };
  } catch (error) {
    return { props: { detail: null, error: pageBackendError(error, "detalle de procedimiento") } };
  }
};

export default function ProcedimientoDetailPage({ detail, downloadHref }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <ProcedureDetailView detail={detail} downloadHref={downloadHref} />;
}

function procedureDownloadHref(id: string): string {
  return `/api/procedures/${encodeURIComponent(id)}/download`;
}
