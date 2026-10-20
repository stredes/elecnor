import type { GetServerSideProps } from "next";
import { procedureReader } from "@/backend/composition/procedures";
import { pageBackendError } from "@/backend/composition/page-error";
import { ProceduresView } from "@/procedures/views/ProceduresView";
import type { ProceduresViewProps } from "@/procedures/contracts/procedure-catalog-contract";

const queryValue = (value: string | string[] | undefined): string => typeof value === "string" ? value : "";

export const getServerSideProps: GetServerSideProps<ProceduresViewProps> = async ({ query }) => {
  const filters = { q: queryValue(query.q), area: queryValue(query.area) };
  try {
    const catalog = await procedureReader.catalog(filters);
    return { props: { families: catalog.families, total: catalog.total, filters } };
  } catch (error) {
    return { props: { families: [], total: 0, filters, error: pageBackendError(error, "procedimientos") } };
  }
};

export default function ProcedimientosPage(props: ProceduresViewProps) {
  return <ProceduresView {...props} />;
}
