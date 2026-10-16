export function calculateTotalApprovals(sections: readonly { readonly approved: number }[]): number {
  return sections.reduce((total, section) => total + section.approved, 0);
}
