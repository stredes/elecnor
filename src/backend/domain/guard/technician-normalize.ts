export function normalizeTechnicianName(name: string | null): string | null {
  if (!name) return null;
  return name.trim().toLowerCase()
    .replace(/[áàäâ]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöô]/g, "o")
    .replace(/[úùüû]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/\s+/g, " ");
}

export function areTechniciansEquivalent(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const na = normalizeTechnicianName(a);
  const nb = normalizeTechnicianName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (levenshtein(na, nb) <= 1) return true;
  return false;
}

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => j === 0 ? i : 0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
}