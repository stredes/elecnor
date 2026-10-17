import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { syntheticInspectionDetail } from "@/backend/composition/synthetic-inspection-loader";
import { InspectionDetailView } from "@/inspections/views/InspectionDetailView";
import type { InspectionDetailViewProps } from "@/inspections/contracts/inspection-detail-view-contract";

export const getServerSideProps: GetServerSideProps<InspectionDetailViewProps> = async ({ params }) => {
  const id = typeof params?.id === "string" ? params.id : "";
  const detail = id ? await syntheticInspectionDetail.execute(id) : null;
  return detail ? { props: { detail } } : { notFound: true };
};

export default function InspectionDetailPage({ detail }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <InspectionDetailView detail={detail} />;
}
