"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/CartProvider";
import type { Recipe } from "@/lib/catalog/types";

/** Ajoute au panier tous les ingrédients de la recette, dans les quantités prévues. */
export function RecipeAddButton({ recipe }: { recipe: Recipe }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    for (const i of recipe.ingredients) {
      add({ productId: i.productId, name: i.name, saleUnit: i.saleUnit, unitPriceMinor: i.unitPriceMinor }, i.quantity);
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={recipe.ingredients.length === 0}
      className="mt-auto w-full rounded-full bg-brand-green px-2 py-2 text-[10px] font-extrabold text-white transition hover:bg-brand-green-dark disabled:bg-black/20 sm:py-2.5 sm:text-xs"
    >
      {added ? "Ajouté au panier ✓" : "＋ Ajouter au panier"}
    </button>
  );
}