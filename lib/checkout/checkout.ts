import { toOrderItems, type Cart } from "@/lib/cart/cart";

export type Zone = { id: number; name: string; fee_minor: number; free_above_minor?: number | null; min_order_minor: number };

export type CheckoutForm = {
  fulfillment: "pickup" | "delivery";
  zoneId: number | null;
  slotId: number | null;
  neighborhood: string;
  landmark: string;
  phone: string;
};

/** Paiement en ligne par carte bancaire (Visa, Mastercard) uniquement. */
export type PaymentMethod = "card";

/** Estimation affichée au client ; le serveur recalcule toujours le montant réel. */
export function estimateDeliveryFee(zone: Zone | undefined, subtotalMinor: number): number {
  if (!zone) return 0;
  if (zone.free_above_minor != null && subtotalMinor >= zone.free_above_minor) return 0;
  return zone.fee_minor;
}

export function belowMinimum(zone: Zone | undefined, subtotalMinor: number): boolean {
  return zone !== undefined && subtotalMinor < zone.min_order_minor;
}

/** Retourne le premier champ manquant ou invalide, ou `null` si le formulaire est complet. */
export function validateForm(form: CheckoutForm): string | null {
  if (form.fulfillment === "pickup") return null;

  if (form.zoneId === null) return "Choisissez votre zone de livraison.";
  if (form.slotId === null) return "Choisissez un créneau de livraison.";
  if (form.neighborhood.trim() === "") return "Indiquez votre adresse de livraison.";
  if (!/^\+?[0-9]{8,15}$/.test(form.phone.replace(/[\s.-]/g, ""))) return "Indiquez un numéro de téléphone valide.";

  return null;
}

/** Corps de la commande : identifiants et quantités uniquement, jamais de prix. */
export function buildOrderPayload(cart: Cart, form: CheckoutForm) {
  const items = toOrderItems(cart);

  if (form.fulfillment === "pickup") return { items, fulfillment: "pickup" as const };

  return {
    items,
    fulfillment: "delivery" as const,
    delivery: {
      zone_id: form.zoneId as number,
      slot_id: form.slotId as number,
      phone: form.phone.replace(/[\s.-]/g, ""),
      address: {
        neighborhood: form.neighborhood.trim(),
        landmark: form.landmark.trim() === "" ? null : form.landmark.trim(),
      },
    },
  };
}

/** Message lisible à partir d'une réponse d'erreur Laravel (validation 422 ou message simple). */
export function extractApiError(error: unknown, fallback = "Une erreur est survenue. Réessayez."): string {
  if (error && typeof error === "object") {
    const { errors, message } = error as { errors?: Record<string, string[]>; message?: string };
    const first = errors ? Object.values(errors).flat()[0] : undefined;

    if (first) return first;
    if (message) return message;
  }

  return fallback;
}

/** N'accepte qu'un chemin interne : empêche une redirection ouverte via `?next=`. */
export function safeNext(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\") || /[\r\n]/.test(next)) return fallback;
  return next;
}

export type GuestContact = { name: string; email: string; phone: string };

/** Premier problème des coordonnées d'un client sans compte, ou `null`. */
export function validateContact(contact: GuestContact): string | null {
  if (contact.name.trim().length < 2) return "Indiquez votre nom.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email.trim())) return "Indiquez une adresse e-mail valide.";
  if (!/^\+?[0-9]{8,15}$/.test(contact.phone.replace(/[\s.-]/g, ""))) return "Indiquez un numéro de téléphone valide.";

  return null;
}