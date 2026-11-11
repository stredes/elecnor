import type { GetServerSideProps } from "next";
import type { ElecnorComparisonResult, ElecnorComparisonStatus } from "@/backend/domain/elecnor-contract";
import { ElecnorComparisonView } from "@/elecnor/ElecnorComparisonView";
import { ReportLayout } from "@/dashboard/components/ReportLayout";

type Props = {
  readonly initial: ElecnorComparisonResult;
  readonly query: { q: string; status: ElecnorComparisonStatus };
  readonly loadError: boolean;
};

const STATUSES = ["all", "with_inspection", "without_inspection", "reviewed", "pending_review"] as const;

function emptyResult(): ElecnorComparisonResult {
  return { data: [], total: 0, limit: 25, offset: 0, metrics: { total_workers: 0, with_inspection: 0,
    without_inspection: 0, exact_matches: 0, variant_matches: 0, reviewed: 0, pending_review: 0 } };
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const q = typeof query.q === "string" ? query.q : "";
  const candidate = typeof query.status === "string" ? query.status : "all";
  const status = (STATUSES as readonly string[]).includes(candidate) ? candidate as ElecnorComparisonStatus : "all";
  // El backend de comparación tarda varios segundos aunque se soliciten pocas filas.
  // Entregamos la estructura de la ruta de inmediato y dejamos la lectura para el cliente.
  return { props: { initial: emptyResult(), query: { q, status }, loadError: false } };
};

export default function ElecnorComparisonPage(props: Props) {
  return <ReportLayout activeRoute="elecnor" homeHref="/"><ElecnorComparisonView {...props} /></ReportLayout>;
}
