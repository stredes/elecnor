import type { Procedure, ProcedureFamily } from "./procedure-contract";

export function groupProcedureFamilies(procedures: readonly Procedure[]): ProcedureFamily[] {
  const grouped = new Map<string, Procedure[]>();
  for (const procedure of procedures) {
    const key = `${procedure.code ?? ""}|${procedure.title}`;
    const family = grouped.get(key) ?? [];
    family.push(procedure);
    grouped.set(key, family);
  }
  return [...grouped.values()]
    .map(toFamily)
    .sort((left, right) => left.code.localeCompare(right.code, "es", { numeric: true }));
}

function toFamily(procedures: Procedure[]): ProcedureFamily {
  const ordered = [...procedures].sort((left, right) =>
    (left.area ?? "").localeCompare(right.area ?? "", "es"));
  return {
    code: ordered[0]?.code ?? "", title: ordered[0]?.title ?? "", procedures: ordered,
    total: ordered.length, conVideo: ordered.filter((item) => Boolean(item.youtubeVideoId)).length,
  };
}
