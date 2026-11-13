import Link from "next/link";
import type { Product } from "@/lib/mock";
import { ProductCard } from "./ProductCard";

type Props = { id: string; title: string; href: string; products: Product[] };

export function ProductRail({ id, title, href, products }: Props) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6" aria-labelledby={id}>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id={id} className="text-2xl font-bold">
          {title}
        </h2>
        <Link href={href} className="text-sm text-brand-red hover:underline">
          Voir tout
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
