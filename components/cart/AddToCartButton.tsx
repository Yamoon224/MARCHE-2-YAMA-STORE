"use client";

import { useState } from "react";
import { QUANTITY_STEP, formatQuantity } from "@/lib/cart/cart";
import { useCart } from "@/lib/cart/CartProvider";
import type { Product } from "@/lib/mock";

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
      className="mt-auto rounded-full bg-brand-green py-1.5 text-sm font-medium text-white disabled:bg-black/20"
    >
      {added ? "Ajouté ✓" : "Ajouter +"}
    </button>
  );
}
