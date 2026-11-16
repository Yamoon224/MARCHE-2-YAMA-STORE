import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/catalog/types";
import { AddToCartButton } from "./cart/AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex w-44 shrink-0 flex-col overflow-hidden rounded-[18px] border border-line bg-white transition hover:-translate-y-[3px] hover:shadow-soft sm:w-52">
      <div
        className="relative flex aspect-[4/3] items-center justify-center bg-[#f4ecd9] text-6xl"
        aria-hidden="true"
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- les images viennent de l'API : domaines non connus à la compilation
          <img src={product.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          "🛒"
        )}
        {product.soldOut && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-black px-2.5 py-1 text-[11px] font-extrabold text-white">Épuisé</span>
        )}
        {product.oldPriceMinor && !product.soldOut && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-brand-red px-2.5 py-1 text-[11px] font-extrabold text-white">Promo</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3.5 pb-3.5 pt-3">
        <h3 className="text-[15px] font-extrabold leading-tight">
          <Link href={`/produits/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="flex-1">
          <span className="text-lg font-extrabold text-brand-red">{formatMoney(product.priceMinor)}</span>{" "}
          {product.oldPriceMinor && (
            <span className="text-xs text-muted line-through">{formatMoney(product.oldPriceMinor)}</span>
          )}
          <span className="block text-xs text-muted">{product.unit}</span>
        </p>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
