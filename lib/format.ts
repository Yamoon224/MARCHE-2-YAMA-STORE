const XOF = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** Montant en plus petite unité monétaire (F CFA : 1 unité) -> "1 200 F CFA". */
export function formatXof(amountMinor: number): string {
  return `${XOF.format(amountMinor).replace(/[  ]/g, " ")} F CFA`;
}
