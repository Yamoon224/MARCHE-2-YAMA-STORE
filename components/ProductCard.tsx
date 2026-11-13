import { formatXof } from "@/lib/format";
import type { Product } from "@/lib/mock";
import { AddToCartButton } from "./cart/AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex w-44 shrink-0 flex-col gap-2 rounded-xl border border-black/10 p-3">
      <div
        className="relative flex h-28 items-center justify-center rounded-lg bg-black/5 text-5xl"
        aria-hidden="true"
      >
        {product.emoji}
        {product.soldOut && (
          <span className="absolute left-2 top-2 rounded bg-black px-2 py-0.5 text-xs text-white">Épuisé</span>
        )}
      </div>
      <h3 className="text-sm font-medium">{product.name}</h3>
      <p>
        <span className="font-bold text-brand-red">{formatXof(product.priceMinor)}</span>{" "}
        {product.oldPriceMinor && (
          <span className="text-xs text-black/50 line-through">{formatXof(product.oldPriceMinor)}</span>
        )}
        <span className="block text-xs text-black/60">{product.unit}</span>
      </p>
      <AddToCartButton product={product} />
    </article>
  );
}
