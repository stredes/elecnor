import type { GetServerSideProps } from "next";
import { syntheticProcedureCatalog } from "@/backend/composition/synthetic-procedure-entrypoint";
import { ProceduresView } from "@/procedures/views/ProceduresView";
import type { ProceduresViewProps } from "@/procedures/contracts/procedure-catalog-contract";

const queryValue = (value: string | string[] | undefined): string => typeof value === "string" ? value : "";

export const getServerSideProps: GetServerSideProps<ProceduresViewProps> = async ({ query }) => {
  const filters = { q: queryValue(query.q), area: queryValue(query.area) };
  const catalog = await syntheticProcedureCatalog.execute(filters);
  return { props: { families: catalog.families, total: catalog.total, filters } };
};

export default function ProcedimientosPage(props: ProceduresViewProps) {
  return <ProceduresView {...props} />;
}
