/** Numéro de page lu dans l'URL : entier ≥ 1, sinon 1 (jamais de valeur absurde transmise à l'API). */
export function toPage(raw: string | string[] | undefined): number {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!/^\d{1,6}$/.test(value)) return 1;

  return Math.max(1, Number(value));
}