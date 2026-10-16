import type { AnswerState } from "./import-draft-contract";

const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const WHITESPACE = /\s+/g;

export type AnswerClassification = {
  readonly state: AnswerState;
  readonly applicable: number | null;
  readonly conforming: number | null;
  readonly nonConforming: number | null;
  readonly notApplicable: number | null;
};

export function normalizeText(value: string | null): string {
  if (value === null) return "";
  const decomposed = value.normalize("NFKD").toLowerCase().replaceAll("ß", "ss");
  const withoutMarks = [...decomposed].filter((item) => !/\p{Mark}/u.test(item)).join("");
  return withoutMarks.replace(NON_ALPHANUMERIC, " ").replace(WHITESPACE, " ").trim();
}

export function classifyAnswer(value: string | null): AnswerClassification {
  const state = answerState(value);
  if (state === "CONFORME") return { state, applicable: 1, conforming: 1, nonConforming: 0, notApplicable: 0 };
  if (state === "NO_CONFORME") return { state, applicable: 1, conforming: 0, nonConforming: 1, notApplicable: 0 };
  if (state === "NA") return { state, applicable: 0, conforming: 0, nonConforming: 0, notApplicable: 1 };
  return { state, applicable: null, conforming: null, nonConforming: null, notApplicable: null };
}

function answerState(value: string | null): AnswerState {
  const key = normalizeText(value);
  if (key === "conforme" || key === "yes") return "CONFORME";
  if (key === "no conforme") return "NO_CONFORME";
  if (key === "na" || key === "n a") return "NA";
  return "DESCONOCIDO";
}
