import Link from "next/link";
import type { Product } from "@/lib/mock";
import { ProductCard } from "./ProductCard";

type Props = { id: string; title: string; href: string; products: Product[] };

export function ProductRail({ id, title, href, products }: Props) {
  return (
    <section className="mx-auto my-8 w-[min(1200px,calc(100%-28px))] sm:my-11" aria-labelledby={id}>
      <div className="mb-4 flex items-end justify-between gap-3.5">
        <h2 id={id} className="text-[21px] font-extrabold sm:text-[26px]">
          {title}
        </h2>
        <Link href={href} className="whitespace-nowrap text-xs font-extrabold text-brand-green hover:underline sm:text-sm">
          Voir tout →
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-3 sm:gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
