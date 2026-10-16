const EPSILON = Number.EPSILON * 4;

export function roundSql(value: number, digits = 2): number {
  return roundHalfAway(value, digits);
}

export function roundPython(value: number, digits = 2): number {
  const factor = 10 ** digits;
  const scaled = value * factor;
  const lower = Math.floor(scaled);
  const fraction = scaled - lower;
  if (Math.abs(fraction - 0.5) < tolerance(scaled)) {
    return (lower % 2 === 0 ? lower : lower + 1) / factor;
  }
  return Math.round(scaled) / factor;
}

function roundHalfAway(value: number, digits: number): number {
  const factor = 10 ** digits;
  const scaled = Math.abs(value) * factor;
  const rounded = Math.floor(scaled + 0.5 + tolerance(scaled)) / factor;
  return value < 0 ? -rounded : rounded;
}

function tolerance(scaled: number): number {
  return Math.max(1, Math.abs(scaled)) * EPSILON;
}
