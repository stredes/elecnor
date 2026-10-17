import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { syntheticProcedureDetail } from "@/backend/composition/synthetic-procedure-entrypoint";
import { ProcedureDetailView } from "@/procedures/views/ProcedureDetailView";
import type { ProcedureDetailViewProps } from "@/procedures/contracts/procedure-detail-view-contract";

export const getServerSideProps: GetServerSideProps<ProcedureDetailViewProps> = async ({ params }) => {
  const id = typeof params?.id === "string" ? params.id : "";
  const detail = id ? await syntheticProcedureDetail.execute(id) : null;
  return detail ? { props: { detail } } : { notFound: true };
};

export default function ProcedimientoDetailPage({ detail }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <ProcedureDetailView detail={detail} />;
}
