import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { pageBackendError } from "@/backend/composition/page-error";
import { supportReaders } from "@/backend/composition/read-models";
import { LogsView } from "@/dashboard/views/LogsView";
import type { LogsViewProps } from "@/dashboard/contracts/support-view-contract";

export const getServerSideProps: GetServerSideProps<LogsViewProps> = async () => {
  try { return { props: { result: await supportReaders.logs() } }; }
  catch (error) { return { props: { result: { count: 0, data: [] }, error: pageBackendError(error, "registro") } }; }
};

export default function LogsPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) { return <LogsView {...props} />; }
