"use client";

import { useRef, useState } from "react";
import { browserApi } from "@/lib/api/client";
import { extractApiError } from "@/lib/checkout/checkout";

/** Reprend ou démarre le paiement par carte (page sécurisée Stripe) d'une commande encore à payer. */
export function PayByCardButton({ orderId }: { orderId: number }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Une clé par clic : un double clic ne crée pas deux paiements.
  const attempt = useRef<string | null>(null);

  async function pay() {
    setError(null);
    setBusy(true);
    const key = (attempt.current ??= crypto.randomUUID());

    try {
      const { data, error: apiError } = await browserApi().POST("/api/v1/orders/{orderId}/payments", {
        params: { path: { orderId }, header: { "Idempotency-Key": key } },
        body: { method: "card" },
      });

      const url = data?.data?.action_url;
      if (url) {
        window.location.assign(url);
        return;
      }

      attempt.current = null;
      setError(apiError ? extractApiError(apiError, "Le paiement par carte n'est pas disponible pour le moment.") : "Le paiement par carte n'est pas disponible pour le moment.");
    } catch {
      attempt.current = null;
      setError("Service momentanément indisponible. Réessayez dans un instant.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button type="button" onClick={pay} disabled={busy} className="rounded-full bg-brand-red px-6 py-2.5 font-extrabold text-white hover:bg-brand-red-dark disabled:opacity-60">
        {busy ? "Redirection…" : "💳 Payer par carte (Visa, Mastercard)"}
      </button>
      {error && <p role="alert" className="rounded-lg bg-brand-red/10 p-3 text-sm text-brand-red">{error}</p>}
    </div>
  );
}