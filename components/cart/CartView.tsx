"use client";

import Link from "next/link";
import { QUANTITY_STEP, formatQuantity, lineTotalMinor } from "@/lib/cart/cart";
import { useCart } from "@/lib/cart/CartProvider";
import { formatMoney } from "@/lib/format";

export function CartView() {
  const { cart, ready, subtotalMinor, setQuantity, remove, clear } = useCart();

  if (!ready) return <p className="text-muted">Chargement du panier…</p>;

  if (cart.lines.length === 0) {
    return (
      <div className="rounded-[18px] border border-line bg-white p-6 text-center sm:p-10">
        <p className="text-lg">Votre panier est vide.</p>
        <Link href="/aisles" className="mt-4 inline-block rounded-full bg-brand-red px-6 py-3 font-extrabold text-white hover:bg-brand-red-dark">
          Découvrir nos produits
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
      <ul className="grid gap-3">
        {cart.lines.map((line) => {
          const step = QUANTITY_STEP[line.saleUnit];
          const base = { productId: line.productId, name: line.name, saleUnit: line.saleUnit, unitPriceMinor: line.unitPriceMinor };

          return (
            <li key={line.productId} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 rounded-2xl border border-line bg-white p-3.5 sm:flex sm:flex-wrap">
              <div className="min-w-0 sm:min-w-40 sm:flex-1">
                <p className="font-medium [overflow-wrap:anywhere]">{line.name}</p>
                <p className="text-sm text-muted">{formatMoney(line.unitPriceMinor)} {line.saleUnit === "piece" ? "l'unité" : line.saleUnit === "kg" ? "le kg" : "le litre"}</p>
              </div>

              <div className="col-span-2 flex items-center justify-between gap-2 sm:col-span-1 sm:justify-start" role="group" aria-label={`Quantité de ${line.name}`}>
                <button
                  type="button"
                  onClick={() => setQuantity(base, Math.max(step, line.quantity - step))}
                  disabled={line.quantity <= step}
                  title={line.quantity <= step ? "Quantité minimale atteinte : utilisez « Retirer » pour supprimer le produit" : undefined}
                  aria-label={`Diminuer la quantité de ${line.name}`}
                  className="h-11 w-11 rounded-full border-2 border-line bg-white text-lg font-bold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>
                <span className="min-w-20 flex-1 text-center text-sm sm:flex-none" aria-live="polite">{formatQuantity(line)}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(base, line.quantity + step)}
                  aria-label={`Augmenter la quantité de ${line.name}`}
                  className="h-11 w-11 rounded-full border-2 border-line bg-white text-lg font-bold"
                >
                  +
                </button>
              </div>

              <p className="text-right font-semibold sm:w-28">{formatMoney(lineTotalMinor(line))}</p>
              <button type="button" onClick={() => remove(line.productId)} className="col-span-2 min-h-11 justify-self-end rounded-full px-3 text-sm text-brand-red hover:underline sm:col-span-1">
                Retirer
              </button>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit rounded-[20px] border border-line bg-white p-5 lg:sticky lg:top-40">
        <h2 className="font-display text-xl font-extrabold">Récapitulatif</h2>
        <p className="mt-3 flex justify-between"><span>Sous-total TTC</span><strong className="text-lg text-brand-red">{formatMoney(subtotalMinor)}</strong></p>
        <p className="mt-1 text-xs text-muted">Frais de livraison calculés à l&apos;étape suivante, selon votre zone.</p>
        <Link href="/checkout" className="mt-4 block rounded-full bg-brand-red py-3.5 text-center font-extrabold text-white transition hover:bg-brand-red-dark">
          Passer la commande
        </Link>
        <button type="button" onClick={clear} className="mt-2 min-h-11 w-full text-sm text-muted hover:text-brand-red">
          Vider le panier
        </button>
      </aside>
    </div>
  );
}
