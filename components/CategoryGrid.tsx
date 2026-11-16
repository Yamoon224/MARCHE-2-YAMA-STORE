import Link from "next/link";
import type { Category } from "@/lib/catalog/types";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto my-8 w-[min(1200px,calc(100%-28px))] sm:my-11" aria-labelledby="rayons">
      <div className="mb-4 flex items-end justify-between gap-3.5">
        <div>
          <h2 id="rayons" className="text-[21px] font-extrabold sm:text-[26px]">
            Nos rayons
          </h2>
          <p className="mt-1 text-sm text-muted">Choisissez un rayon, trouvez vos produits.</p>
        </div>
        <Link href="/rayons" className="whitespace-nowrap text-xs font-extrabold text-brand-green hover:underline sm:text-sm">
          Voir tout →
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-5">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/rayons/${c.slug}`}
              className="flex flex-col items-center gap-2 rounded-[18px] border border-line bg-white px-2 pb-3.5 pt-2 text-center transition hover:-translate-y-1 hover:shadow-soft"
            >
              <span
                className="grid aspect-square w-full place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-[#fff0d5] to-[#f3d49b] text-5xl"
                aria-hidden="true"
              >
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- images de l'API, domaines inconnus à la compilation
                  <img src={c.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  (c.icon ?? "🛒")
                )}
              </span>
              <span className="text-sm font-bold">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}