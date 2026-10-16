export const TECHNICIAN_PROFILE_LIMIT = 500;

export function selectTechnicianProfile<T extends { readonly technician: string | null }>(
  items: readonly T[],
  technician: string,
): readonly T[] {
  return items.filter((item) => item.technician === technician).slice(0, TECHNICIAN_PROFILE_LIMIT);
}
