import type { ReportingDetailMetric } from "./reporting-details-contract";

export function mapInspectionMetric(fact: ReportingDetailMetric) {
  const applicable = fact.applicable ?? 0;
  const conforming = fact.conforming ?? 0;
  const notApplicable = fact.notApplicable ?? 0;
  return {
    inspectionId: fact.inspectionId, code: fact.code ?? "", metric: fact.metric ?? "",
    section: fact.section ?? "", status: fact.state ?? "", applicable, conforming,
    nonConforming: Number(fact.state === "NO_CONFORME"), notApplicable,
    observation: fact.observation, observations: applicable + notApplicable,
    compliance: applicable > 0 ? Number((100 * conforming / applicable).toFixed(2)) : null,
  };
}
