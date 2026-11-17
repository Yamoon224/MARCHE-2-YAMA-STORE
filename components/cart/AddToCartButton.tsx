"use client";

import { useState } from "react";
import { QUANTITY_STEP, formatQuantity } from "@/lib/cart/cart";
import { useCart } from "@/lib/cart/CartProvider";
import type { Product } from "@/lib/catalog/types";

/** `wide` : bouton pleine largeur des cartes ; `round` : bouton « ＋ » de la liste catalogue. */
export function AddToCartButton({ product, variant = "wide" }: { product: Product; variant?: "wide" | "round" }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    add({ productId: product.id, name: product.name, saleUnit: product.saleUnit, unitPriceMinor: product.priceMinor });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  const step = formatQuantity({ saleUnit: product.saleUnit, quantity: QUANTITY_STEP[product.saleUnit] });
  const label = `Ajouter ${step} de ${product.name} au panier`;

  if (variant === "round") {
    return (
      <button
        type="button"
        disabled={product.soldOut}
        onClick={handleClick}
        aria-label={label}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-green p-0 text-[22px] font-bold leading-none text-white shadow-[0_3px_9px_#087b3525] hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:bg-black/20"
      >
        {added ? "✓" : "＋"}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={product.soldOut}
      onClick={handleClick}
      aria-label={label}
      className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-green px-2 py-2 text-[10px] font-extrabold text-white hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:bg-black/20 sm:px-3 sm:py-2.5 sm:text-xs"
    >
      {added ? "Ajouté ✓" : "＋ Ajouter au panier"}
    </button>
  );
}
