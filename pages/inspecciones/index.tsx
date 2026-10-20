import type { GetServerSideProps } from "next";
import { inspectionQuery } from "@/backend/composition/inspections";
import { resolveInspectionScope } from "@/backend/composition/inspection-scope";
import { pageBackendError } from "@/backend/composition/page-error";
import { INSPECTION_PAGE_SIZE } from "@/backend/domain/inspection-list-contract";
import { parseInspectionPage, parseInspectionQuery } from "@/backend/domain/inspection-list-query";
import { InspectionsView } from "@/inspections/views/InspectionsView";
import type { InspectionsViewProps } from "@/inspections/contracts/inspection-view-contract";

// NP-0030 compatibility trace: the previous route used "@/backend/composition/inspections"
// and "@/dashboard/components/InspectionListScreen"; NP-0042 now delegates to the new view.
export const getServerSideProps: GetServerSideProps<InspectionsViewProps> = async ({ query }) => {
  const page = parseInspectionPage(query.page);
  const parsed = parseInspectionQuery(query);
  const listQuery = { ...parsed, limit: INSPECTION_PAGE_SIZE, offset: (page - 1) * INSPECTION_PAGE_SIZE };
  try {
    const list = await inspectionQuery.execute(listQuery);
    return { props: { list, query: listQuery, page, scope: resolveInspectionScope() } };
  } catch (error) {
    return { props: { list: { data: [], total: 0, limit: listQuery.limit, offset: listQuery.offset, dates: [], auditors: [], regions: [] }, query: listQuery, page, scope: resolveInspectionScope(), error: pageBackendError(error, "inspecciones") } };
  }
};

export default function InspeccionesPage(props: InspectionsViewProps) {
  return <InspectionsView {...props} />;
}
