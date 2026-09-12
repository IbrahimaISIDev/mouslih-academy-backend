/** Même logique que getInitials() côté frontend (src/lib/format.ts) : "Aminata Diallo" → "AD". */
export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}
