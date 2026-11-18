import Link from "next/link";
import type { Category } from "@/lib/catalog/types";
import { ImageWithFallback } from "./ImageWithFallback";
import { SectionHead } from "./SectionHead";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section id="categories" className="mx-auto mb-8 mt-10 w-[min(1200px,calc(100%-22px))] sm:mt-[54px] sm:w-[min(1200px,calc(100%-44px))]" aria-labelledby="categories-titre">
      <SectionHead
        id="categories-titre"
        title="Nos catégories"
        subtitle="Tout ce qu’il faut pour retrouver les saveurs du pays."
        href="/aisles"
        linkLabel="Voir les produits →"
      />
      <ul className="grid grid-cols-3 gap-2.5 sm:gap-[15px] lg:grid-cols-6">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/aisles/${c.slug}`}
              className="block rounded-[15px] border border-line bg-white px-1.5 pb-2.5 pt-2 text-center shadow-[0_4px_14px_#1a30100a] transition hover:-translate-y-1.5 hover:border-[#b9dfc3] hover:shadow-soft sm:rounded-[19px] sm:px-[9px] sm:pb-[13px] sm:pt-2.5"
            >
              {c.imageUrl ? (
                <ImageWithFallback src={c.imageUrl} className="mb-2.5 h-[83px] w-full rounded-[10px] sm:h-[110px] sm:rounded-[13px]" />
              ) : (
                <span
                  aria-hidden="true"
                  className="mb-2.5 grid h-[83px] w-full place-items-center rounded-[10px] bg-gradient-to-br from-[#fff0d5] to-[#f3d49b] text-4xl sm:h-[110px] sm:rounded-[13px]"
                >
                  {c.icon ?? "🛒"}
                </span>
              )}
              <b className="text-[11px] sm:text-[13px]">{c.name}</b>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
