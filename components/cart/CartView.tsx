"use client";

import Link from "next/link";
import { QUANTITY_STEP, formatQuantity, lineTotalMinor } from "@/lib/cart/cart";
import { useCart } from "@/lib/cart/CartProvider";
import { formatXof } from "@/lib/format";

export function CartView() {
  const { cart, ready, subtotalMinor, setQuantity, remove, clear } = useCart();

  if (!ready) return <p className="text-black/60">Chargement du panier…</p>;

  if (cart.lines.length === 0) {
    return (
      <div className="rounded-xl border border-black/10 p-8 text-center">
        <p className="text-lg">Votre panier est vide.</p>
        <Link href="/rayons" className="mt-4 inline-block rounded-full bg-brand-green px-5 py-2 font-medium text-white">
          Découvrir nos produits
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <ul className="divide-y divide-black/10 rounded-xl border border-black/10">
        {cart.lines.map((line) => {
          const step = QUANTITY_STEP[line.saleUnit];
          const base = { productId: line.productId, name: line.name, saleUnit: line.saleUnit, unitPriceMinor: line.unitPriceMinor };

          return (
            <li key={line.productId} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-40 flex-1">
                <p className="font-medium">{line.name}</p>
                <p className="text-sm text-black/60">{formatXof(line.unitPriceMinor)} {line.saleUnit === "piece" ? "l'unité" : line.saleUnit === "kg" ? "le kg" : "le litre"}</p>
              </div>

              <div className="flex items-center gap-2" role="group" aria-label={`Quantité de ${line.name}`}>
                <button
                  type="button"
                  onClick={() => setQuantity(base, line.quantity - step)}
                  aria-label={`Diminuer la quantité de ${line.name}`}
                  className="h-8 w-8 rounded-full border border-black/20"
                >
                  −
                </button>
                <span className="min-w-20 text-center text-sm" aria-live="polite">{formatQuantity(line)}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(base, line.quantity + step)}
                  aria-label={`Augmenter la quantité de ${line.name}`}
                  className="h-8 w-8 rounded-full border border-black/20"
                >
                  +
                </button>
              </div>

              <p className="w-28 text-right font-semibold">{formatXof(lineTotalMinor(line))}</p>
              <button type="button" onClick={() => remove(line.productId)} className="text-sm text-brand-red hover:underline">
                Retirer
              </button>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit rounded-xl border border-black/10 p-4">
        <h2 className="text-lg font-semibold">Récapitulatif</h2>
        <p className="mt-3 flex justify-between"><span>Sous-total TTC</span><strong>{formatXof(subtotalMinor)}</strong></p>
        <p className="mt-1 text-xs text-black/60">Frais de livraison calculés à l&apos;étape suivante, selon votre zone.</p>
        <Link href="/commande" className="mt-4 block rounded-full bg-brand-red py-2.5 text-center font-medium text-white">
          Passer la commande
        </Link>
        <button type="button" onClick={clear} className="mt-3 w-full text-sm text-black/60 hover:text-brand-red">
          Vider le panier
        </button>
      </aside>
    </div>
  );
}
