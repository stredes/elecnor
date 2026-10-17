import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { syntheticTechnicianProfile } from "@/backend/composition/synthetic-inspection-loader";
import { TechnicianView } from "@/technicians/views/TechnicianView";
import type { TechnicianViewProps } from "@/technicians/contracts/technician-view-contract";

export const getServerSideProps: GetServerSideProps<TechnicianViewProps> = async ({ params }) => {
  const encoded = typeof params?.nombre === "string" ? params.nombre : "";
  const technician = encoded ? decodeURIComponent(encoded) : "";
  return technician ? { props: { profile: await syntheticTechnicianProfile(technician).execute() } } : { notFound: true };
};

export default function TechnicianPage({ profile }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <TechnicianView profile={profile} />;
}
