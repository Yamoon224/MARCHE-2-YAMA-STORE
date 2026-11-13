"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserApi } from "@/lib/api/client";
import { extractApiError } from "@/lib/checkout/checkout";

export function CancelOrderButton({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    if (!window.confirm("Annuler cette commande ?")) return;

    setBusy(true);
    setError(null);

    const { error: failure } = await browserApi().POST("/api/v1/orders/{order}/transitions", {
      params: { path: { order: orderId } },
      body: { to: "cancelled", reason: "Annulée par le client" },
    });

    setBusy(false);

    if (failure) return setError(extractApiError(failure));
    router.refresh();
  }

  return (
    <div>
      <button type="button" onClick={cancel} disabled={busy} className="rounded-full border border-brand-red px-4 py-2 text-sm font-medium text-brand-red disabled:opacity-60">
        {busy ? "Annulation…" : "Annuler la commande"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-brand-red">{error}</p>}
    </div>
  );
}
