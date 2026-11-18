import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/catalog/types";
import { AddToCartButton } from "./cart/AddToCartButton";
import { ImageWithFallback } from "./ImageWithFallback";
import { SectionHead } from "./SectionHead";

/** Liste catalogue en deux colonnes (une sur mobile) : image, nom, description, prix et bouton d'ajout. */
export function ProductList({ id, title, subtitle, products }: { id: string; title: string; subtitle?: string; products: Product[] }) {
  return (
    <section id={id} className="mx-auto mb-12 mt-8 w-[min(1200px,calc(100%-22px))] sm:w-[min(1200px,calc(100%-44px))]" aria-labelledby={`${id}-titre`}>
      <SectionHead id={`${id}-titre`} title={title} subtitle={subtitle} href="/aisles" linkLabel="Tous les produits →" />
      <ul className="grid gap-2.5 min-[620px]:grid-cols-2 min-[620px]:gap-3">
        {products.map((p) => (
          <li
            key={p.id}
            className="relative flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-white p-2.5 shadow-[0_4px_14px_#1a301008] transition hover:-translate-y-[3px] hover:shadow-soft"
          >
            <ImageWithFallback src={p.imageUrl} className="h-[68px] w-[68px] shrink-0 rounded-xl sm:h-[76px] sm:w-[76px]" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Link href={`/products/${p.slug}`} className="text-[13px] font-bold leading-tight hover:underline after:absolute after:inset-0 after:content-['']">
                {p.name}
              </Link>
              {p.description && <small className="line-clamp-2 text-[11px] leading-snug text-muted">{p.description}</small>}
              <span className="text-sm font-extrabold text-brand-red">
                {formatMoney(p.priceMinor)} <span className="text-[11px] font-normal text-muted">{p.unit}</span>
              </span>
            </div>
            <AddToCartButton product={p} variant="round" />
          </li>
        ))}
      </ul>
    </section>
  );
}
