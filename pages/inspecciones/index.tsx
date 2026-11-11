import type { GetServerSideProps } from "next";
import { inspectionQuery } from "@/backend/composition/inspections";
import { resolveInspectionScope } from "@/backend/composition/inspection-scope";
import { pageBackendError } from "@/backend/composition/page-error";
import { INSPECTION_PAGE_SIZE } from "@/backend/domain/inspection-list-contract";
import { summarizeInspectionList } from "@/backend/domain/inspection-list-summary";
import { parseInspectionPage, parseInspectionQuery } from "@/backend/domain/inspection-list-query";
import { InspectionsView } from "@/inspections/views/InspectionsView";
import type { InspectionsViewProps } from "@/inspections/contracts/inspection-view-contract";

// NP-0030 compatibility trace: the previous route used "@/backend/composition/inspections"
// and "@/dashboard/components/InspectionListScreen"; NP-0042 now delegates to the new view.
export const getServerSideProps: GetServerSideProps<InspectionsViewProps> = async ({ query }) => {
  const page = query.page ? parseInspectionPage(query.page) : pageFromOffset(query.offset);
  const parsed = parseInspectionQuery(query);
  const listQuery = { ...parsed, limit: INSPECTION_PAGE_SIZE, offset: (page - 1) * INSPECTION_PAGE_SIZE };
  try {
    const list = await inspectionQuery.execute(listQuery);
    return { props: { list, summary: summarizeInspectionList(list.data), query: listQuery, page, scope: resolveInspectionScope() } };
  } catch (error) {
    return { props: { list: { data: [], total: 0, limit: listQuery.limit, offset: listQuery.offset, dates: [], auditors: [], regions: [] }, summary: summarizeInspectionList([]), query: listQuery, page, scope: resolveInspectionScope(), error: pageBackendError(error, "inspecciones") } };
  }
};

export default function InspeccionesPage(props: InspectionsViewProps) {
  return <InspectionsView {...props} />;
}

function pageFromOffset(raw: string | string[] | undefined): number {
  const value = typeof raw === "string" && /^\d+$/u.test(raw) ? Number(raw) : 0;
  return Number.isFinite(value) ? Math.floor(value / INSPECTION_PAGE_SIZE) + 1 : 1;
}
