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
      className="mt-3 w-full rounded-full bg-brand-red py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-red-dark disabled:bg-black/20"
    >
      {added ? "Ajoutés au panier ✓" : "Ajouter tous les ingrédients"}
    </button>
  );
}