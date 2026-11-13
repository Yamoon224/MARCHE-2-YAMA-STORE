export type DeliveryStatus = "pending" | "assigned" | "out_for_delivery" | "delivered" | "failed" | "returned";

/** Formulations destinées au client (pas le jargon de la régulation). */
export const TRACKING_LABEL: Record<DeliveryStatus, string> = {
  pending: "Votre commande est prête : un livreur va lui être attribué.",
  assigned: "Un livreur est assigné à votre commande.",
  out_for_delivery: "Votre livreur est en route.",
  delivered: "Votre commande a été remise.",
  failed: "La remise n'a pas abouti : nous vous recontactons.",
  returned: "Votre commande est retournée au magasin.",
};

/** Le suivi n'a de sens que pour une livraison à domicile arrivée au stade « prête » ou au-delà. */
const TRACKED_ORDER_STATUSES = ["ready", "assigned", "out_for_delivery", "delivery_failed", "delivered", "returned"];

export function shouldShowTracking(orderStatus: string, fulfillment: string | undefined): boolean {
  return fulfillment === "delivery" && TRACKED_ORDER_STATUSES.includes(orderStatus);
}

/** Délai avant le prochain rafraîchissement, ou `null` quand le suivi est terminé. */
export function nextPollDelay(status: DeliveryStatus): number | null {
  if (status === "out_for_delivery") return 15_000; // position en direct
  if (status === "pending" || status === "assigned" || status === "failed") return 60_000;

  return null;
}

/** "482913" -> "482 913" : plus facile à dicter au livreur. */
export function formatCode(code: string): string {
  return /^\d{6}$/.test(code) ? `${code.slice(0, 3)} ${code.slice(3)}` : code;
}

export function mapsUrl(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
}

/** "à l'instant", "il y a 40 s", "il y a 3 min" : la fraîcheur de la position affichée. */
export function formatAge(recordedAtIso: string, now: number): string {
  const seconds = Math.max(0, Math.round((now - new Date(recordedAtIso).getTime()) / 1000));

  if (Number.isNaN(seconds)) return "";
  if (seconds < 10) return "à l'instant";
  if (seconds < 60) return `il y a ${seconds} s`;

  return `il y a ${Math.round(seconds / 60)} min`;
}
