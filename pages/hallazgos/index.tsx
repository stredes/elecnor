import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { pageBackendError } from "@/backend/composition/page-error";
import { supportReaders } from "@/backend/composition/read-models";
import { FindingsView } from "@/dashboard/views/FindingsView";
import type { FindingsViewProps } from "@/dashboard/contracts/support-view-contract";

export const getServerSideProps: GetServerSideProps<FindingsViewProps> = async () => {
  try { return { props: { result: await supportReaders.findings() } }; }
  catch (error) { return { props: { result: { count: 0, data: [] }, error: pageBackendError(error, "hallazgos") } }; }
};

export default function FindingsPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) { return <FindingsView {...props} />; }
