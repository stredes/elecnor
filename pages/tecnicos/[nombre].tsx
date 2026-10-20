import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { createTechnicianProfileQuery } from "@/backend/composition/technician-profile";
import { pageBackendError } from "@/backend/composition/page-error";
import { TechnicianView } from "@/technicians/views/TechnicianView";
import type { TechnicianViewProps } from "@/technicians/contracts/technician-view-contract";

export const getServerSideProps: GetServerSideProps<TechnicianViewProps> = async ({ params }) => {
  const encoded = typeof params?.nombre === "string" ? params.nombre : "";
  const technician = encoded ? decodeURIComponent(encoded) : "";
  if (!technician) return { notFound: true };
  try {
    return { props: { profile: await createTechnicianProfileQuery(technician).execute() } };
  } catch (error) {
    return { props: { profile: { technician, inspections: [], promedio: null, bajo70: 0, auditores: 0, fechas: 0 }, error: pageBackendError(error, "perfil del técnico") } };
  }
};

export default function TechnicianPage({ profile }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <TechnicianView profile={profile} />;
}
