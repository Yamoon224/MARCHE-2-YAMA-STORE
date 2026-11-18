"use client";

import { useState, type FormEvent } from "react";
import { browserApi } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { formatQuantity } from "@/lib/cart/cart";
import { formatMoney } from "@/lib/format";
import { statusLabel } from "@/lib/orders/status";
import { StatusBadge } from "./StatusBadge";

type Order = components["schemas"]["Order"];

const when = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" });
const field = "mt-1 min-h-11 w-full rounded-lg border border-black/20 bg-white px-3 py-2 outline-none focus:border-brand-green";

/** Suivi d'une commande sans compte : numéro + e-mail utilisé à la commande. */
export function OrderLookup() {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setOrder(null);

    const data = new FormData(event.currentTarget);
    const number = String(data.get("number") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    if (!number || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return setError("Indiquez votre numéro de commande et l'adresse e-mail utilisée pour commander.");
    }

    setBusy(true);
    try {
      const { data: result, response } = await browserApi().POST("/api/v1/orders/lookup", { body: { number, email } });

      if (response.status === 429) return setError("Trop de tentatives. Réessayez dans une minute.");
      if (!result?.data) return setError("Aucune commande ne correspond à ces informations. Vérifiez le numéro et l'e-mail.");

      setOrder(result.data);
    } catch {
      setError("Service momentanément indisponible. Réessayez dans un instant.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submit} className="grid max-w-xl gap-4 rounded-[18px] border border-line bg-white p-4 sm:p-5" noValidate>
        <label className="text-sm font-medium">
          Numéro de commande
          <input name="number" required autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="Ex. CMD-00000123" className={field} />
        </label>
        <label className="text-sm font-medium">
          E-mail utilisé pour la commande
          <input name="email" type="email" inputMode="email" required autoComplete="email" placeholder="Ex. awa@exemple.com" className={field} />
        </label>
        {error && <p role="alert" className="rounded-lg bg-brand-red/10 p-3 text-sm text-brand-red">{error}</p>}
        <button type="submit" disabled={busy} className="min-h-12 w-full rounded-full bg-brand-red px-6 py-3 font-extrabold text-white hover:bg-brand-red-dark disabled:opacity-60 sm:w-fit">
          {busy ? "Recherche…" : "Suivre ma commande"}
        </button>
      </form>

      {order && (
        <section aria-labelledby="commande" className="max-w-xl rounded-[18px] border border-line bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="commande" className="font-display text-xl font-extrabold">{order.number ?? `Commande ${order.id}`}</h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted">{order.fulfillment === "delivery" ? "Livraison à domicile" : "Retrait en magasin"}</p>

          <ul className="mt-4 flex flex-col gap-1 text-sm">
            {(order.lines ?? []).map((line) => (
              <li key={line.id} className="flex justify-between gap-3">
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  {line.name} <span className="text-muted">({formatQuantity({ saleUnit: (line.sale_unit ?? "piece") as "piece" | "kg" | "l", quantity: line.quantity })})</span>
                </span>
                <span>{formatMoney(line.line_total_minor)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-t border-line pt-3 text-sm">
            <dt>Sous-total</dt><dd className="text-right">{formatMoney(order.subtotal_minor ?? 0)}</dd>
            <dt>Livraison</dt><dd className="text-right">{order.delivery_fee_minor ? formatMoney(order.delivery_fee_minor) : "Offerte"}</dd>
            <dt className="font-bold">Total TTC</dt><dd className="text-right font-bold text-brand-red">{formatMoney(order.total_minor)}</dd>
          </dl>

          {(order.history ?? []).length > 0 && (
            <>
              <h3 className="mt-5 font-extrabold">Historique</h3>
              <ol className="mt-2 flex flex-col gap-1.5 text-sm">
                {(order.history ?? []).map((entry, index) => (
                  <li key={index} className="flex flex-col gap-0.5 min-[420px]:flex-row min-[420px]:justify-between min-[420px]:gap-2">
                    <span>{statusLabel(entry.to_status)}</span>
                    <span className="text-muted">{entry.created_at ? when.format(new Date(entry.created_at)) : ""}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      )}
    </div>
  );
}