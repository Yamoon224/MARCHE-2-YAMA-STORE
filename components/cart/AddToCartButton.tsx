"use client";

import { useState } from "react";
import { QUANTITY_STEP, formatQuantity } from "@/lib/cart/cart";
import { useCart } from "@/lib/cart/CartProvider";
import { CartIcon } from "./CartIcon";
import type { Product } from "@/lib/catalog/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    add({ productId: product.id, name: product.name, saleUnit: product.saleUnit, unitPriceMinor: product.priceMinor });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  const step = formatQuantity({ saleUnit: product.saleUnit, quantity: QUANTITY_STEP[product.saleUnit] });

  return (
    <button
      type="button"
      disabled={product.soldOut}
      onClick={handleClick}
      aria-label={`Ajouter ${step} de ${product.name} au panier`}
      className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-green px-3.5 py-2 text-[13px] font-extrabold text-white hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:bg-black/20"
    >
      <CartIcon />
      {added ? "Ajouté ✓" : "Ajouter"}
    </button>
  );
}
