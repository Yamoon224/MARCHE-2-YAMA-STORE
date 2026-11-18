import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/catalog/types";
import { AddToCartButton } from "./cart/AddToCartButton";
import { ImageWithFallback } from "./ImageWithFallback";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex w-full min-w-0 flex-col overflow-hidden rounded-[15px] border border-[#edf0eb] bg-white p-[7px] text-foreground transition hover:-translate-y-[5px] hover:shadow-[0_12px_25px_#4d00101c] sm:rounded-[18px] sm:p-[9px]">
      <div className="relative">
        <ImageWithFallback src={product.imageUrl} className="h-[120px] w-full rounded-[10px] sm:h-[145px] sm:rounded-[13px]" />
        {product.soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-black px-2.5 py-1 text-[11px] font-extrabold text-white">Épuisé</span>
        )}
        {product.oldPriceMinor && !product.soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-brand-red px-2.5 py-1 text-[11px] font-extrabold text-white">Promo</span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-[3px] pb-0.5 pt-[9px] sm:px-[5px] sm:pt-[11px]">
        <h3 className="min-h-[29px] text-xs font-extrabold leading-tight sm:min-h-[34px] sm:text-sm">
          <Link href={`/products/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        {product.description && (
          <p className="mt-[3px] line-clamp-2 min-h-[29px] text-[10px] leading-[1.4] text-muted sm:text-[11px]">{product.description}</p>
        )}
        <p className="my-1.5 flex-1 sm:my-2">
          <span className="text-sm font-extrabold text-brand-red sm:text-base">{formatMoney(product.priceMinor)}</span>{" "}
          {product.oldPriceMinor && (
            <span className="text-xs text-muted line-through">{formatMoney(product.oldPriceMinor)}</span>
          )}
          <span className="block text-[11px] text-muted">{product.unit}</span>
        </p>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
