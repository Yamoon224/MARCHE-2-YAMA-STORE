import Link from "next/link";
import { categories } from "@/lib/mock";

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8" aria-labelledby="rayons">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 id="rayons" className="text-2xl font-bold">
          Nos rayons
        </h2>
        <Link href="/rayons" className="text-sm text-brand-red hover:underline">
          Voir tout
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/rayons/${c.slug}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-black/10 p-4 text-center hover:border-brand-green"
            >
              <span className="text-4xl" aria-hidden="true">
                {c.emoji}
              </span>
              <span className="text-sm font-medium">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
