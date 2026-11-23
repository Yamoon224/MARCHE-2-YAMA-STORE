"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { browserApi } from "@/lib/api/client";
import { extractApiError } from "@/lib/checkout/checkout";

/** Choisit le paiement en espèces d'une commande encore à payer : à la livraison ou, pour un retrait, en magasin. */
export function PayByCashButton({ orderId, delivery }: { orderId: string; delivery: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Une clé par clic : un double clic ne crée pas deux paiements.
  const attempt = useRef<string | null>(null);

  async function choose() {
    setError(null);
    setBusy(true);
    const key = (attempt.current ??= crypto.randomUUID());

    try {
      const { error: apiError } = await browserApi().POST("/api/v1/orders/{orderId}/payments", {
        params: { path: { orderId }, header: { "Idempotency-Key": key } },
        body: { method: "cash_on_delivery" },
      });

      if (apiError) {
        attempt.current = null;
        setError(extractApiError(apiError, "Le paiement en espèces n'est pas disponible pour le moment."));
        return;
      }

      router.push(`/orders/${orderId}?paiement=cash_on_delivery`);
      router.refresh();
    } catch {
      attempt.current = null;
      setError("Service momentanément indisponible. Réessayez dans un instant.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-start">
      <button type="button" onClick={choose} disabled={busy} className="min-h-12 w-full rounded-full border border-brand-green px-6 py-3 font-extrabold text-brand-green hover:bg-brand-green/10 disabled:opacity-60 sm:w-auto">
        {busy ? "Enregistrement…" : `💶 Payer en espèces ${delivery ? "à la livraison" : "au magasin"}`}
      </button>
      {error && <p role="alert" className="rounded-lg bg-brand-red/10 p-3 text-sm text-brand-red">{error}</p>}
    </div>
  );
}
