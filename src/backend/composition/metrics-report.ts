import { createInspectionQuery } from "./inspections";
import { parseInspectionQuery } from "../domain/inspection-list-query";
import { findRepeatedInspectionGroups } from "../domain/inspection-list-repetition";
import { reportingViewQuery } from "./reporting-view";
import { toLegacyDashboardModel } from "@/dashboard/contracts/legacy-dashboard-contract";
import { createAsyncCache } from "./async-cache";

export const metricsReportCache = createAsyncCache(async () => {
  const [payload, repeatedInspectionGroups] = await Promise.all([
    reportingViewQuery.execute(),
    loadRepeatedInspectionGroups(),
  ]);
  return toLegacyDashboardModel(payload, repeatedInspectionGroups);
}, 30_000);

async function loadRepeatedInspectionGroups() {
  try {
    const inspections = await createInspectionQuery().execute(parseInspectionQuery({ limit: "1000", sort: "date_asc" }));
    return findRepeatedInspectionGroups(inspections.data);
  } catch {
    return [];
  }
}
