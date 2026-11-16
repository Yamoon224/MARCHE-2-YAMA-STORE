const EUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

/** Montant en centimes d'euro -> "12,90 €". */
export function formatMoney(amountMinor: number): string {
  return EUR.format(amountMinor / 100).replace(/[\u00a0\u202f]/g, " ");
}

/**
 * Saisie d'un montant en euros ("12", "12,5", "12.50", "1 250,00") -> centimes entiers ; `null` si invalide.
 * Au plus deux décimales, jamais de signe ni d'exposant.
 */
export function parseEuros(input: string): number | null {
  const text = input.replace(/[\s\u00a0\u202f]/g, "");
  const match = /^(\d{1,7})(?:[.,](\d{1,2}))?$/.exec(text);
  if (!match) return null;

  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
}
