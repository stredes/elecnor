import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { pageBackendError } from "@/backend/composition/page-error";
import { supportReaders } from "@/backend/composition/read-models";
import { UnknownsView } from "@/dashboard/views/UnknownsView";
import type { UnknownsViewProps } from "@/dashboard/contracts/support-view-contract";

export const getServerSideProps: GetServerSideProps<UnknownsViewProps> = async () => {
  try { return { props: { result: await supportReaders.unknowns() } }; }
  catch (error) { return { props: { result: { count: 0, data: [] }, error: pageBackendError(error, "métricas sin clasificar") } }; }
};

export default function UnknownsPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) { return <UnknownsView {...props} />; }
