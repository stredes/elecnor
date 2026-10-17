import type { Procedure, ProcedureList, ProcedureQuery } from "./procedure-contract";

export function selectProcedures(procedures: readonly Procedure[], query: ProcedureQuery): ProcedureList {
  const text = query.q.trim().toLocaleLowerCase("es");
  const area = query.area.trim();
  const data = procedures.filter((procedure) => matches(procedure, text, area)).sort(order);
  return { total: data.length, data };
}

function matches(procedure: Procedure, text: string, area: string): boolean {
  if (area && procedure.area !== area) return false;
  if (!text) return true;
  return [procedure.title, procedure.area, procedure.description, procedure.code]
    .some((value) => value?.toLocaleLowerCase("es").includes(text));
}

function order(left: Procedure, right: Procedure): number {
  return (left.area ?? "").localeCompare(right.area ?? "", "es")
    || left.title.localeCompare(right.title, "es");
}
