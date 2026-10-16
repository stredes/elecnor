import type { GetServerSideProps } from "next";
import { inspectionQuery } from "@/backend/composition/inspections";
import { INSPECTION_PAGE_SIZE } from "@/backend/domain/inspection-list-contract";
import { parseInspectionPage, parseInspectionQuery } from "@/backend/domain/inspection-list-query";
import { InspectionListScreen } from "@/dashboard/components/InspectionListScreen";
import type { InspectionListPageProps } from "@/dashboard/contracts/inspection-list-page-contract";

export const getServerSideProps: GetServerSideProps<InspectionListPageProps> = async ({ query }) => {
  const page = parseInspectionPage(query.page);
  const parsed = parseInspectionQuery(query);
  const listQuery = { ...parsed, limit: INSPECTION_PAGE_SIZE, offset: (page - 1) * INSPECTION_PAGE_SIZE };
  const list = await inspectionQuery.execute(listQuery);
  return { props: { list, query: listQuery, page } };
};

export default function InspeccionesPage(props: InspectionListPageProps) {
  return <InspectionListScreen {...props} />;
}
