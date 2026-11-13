/** Libellés clients des statuts de commande (cycle de vie défini côté backend). */
export const STATUS_LABEL: Record<string, string> = {
  draft: "Brouillon",
  awaiting_payment: "En attente de paiement",
  payment_failed: "Paiement échoué",
  paid: "Payée",
  under_review: "En vérification",
  confirmed: "Confirmée",
  preparing: "En préparation",
  ready: "Prête",
  assigned: "Livreur assigné",
  out_for_delivery: "En cours de livraison",
  delivery_failed: "Livraison échouée",
  delivered: "Livrée",
  completed: "Terminée",
  claim: "Réclamation en cours",
  refunded: "Remboursée",
  returned: "Retournée au magasin",
  cancelled: "Annulée",
};

export function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

const NEGATIVE = new Set(["payment_failed", "delivery_failed", "cancelled", "returned", "claim"]);
const DONE = new Set(["completed", "delivered", "refunded"]);

export type StatusTone = "negative" | "done" | "progress";

export function statusTone(status: string): StatusTone {
  if (NEGATIVE.has(status)) return "negative";
  if (DONE.has(status)) return "done";
  return "progress";
}

/** Le client peut annuler tant que la commande n'est pas remise au livreur. */
const CANCELLABLE = new Set(["draft", "awaiting_payment", "payment_failed", "paid", "under_review", "confirmed", "preparing"]);

export function canCancel(status: string): boolean {
  return CANCELLABLE.has(status);
}

export function canPay(status: string): boolean {
  return status === "awaiting_payment" || status === "payment_failed";
}
