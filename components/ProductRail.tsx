import type { Product } from "@/lib/catalog/types";
import { ProductCard } from "./ProductCard";
import { SectionHead } from "./SectionHead";

type Props = { id: string; title: string; subtitle?: string; href: string; products: Product[] };

export function ProductRail({ id, title, subtitle, href, products }: Props) {
  return (
    <section id={id} className="mx-auto my-8 w-[min(1200px,calc(100%-22px))] sm:my-9 sm:w-[min(1200px,calc(100%-44px))]" aria-labelledby={`${id}-titre`}>
      <SectionHead id={`${id}-titre`} title={title} subtitle={subtitle} href={href} />
      <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
        {products.map((p) => (
          <li key={p.id} className="flex">
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
