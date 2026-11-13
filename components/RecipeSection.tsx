import { formatXof } from "@/lib/format";
import { recipes } from "@/lib/mock";

export function RecipeSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8" aria-labelledby="recettes">
      <h2 id="recettes" className="mb-4 text-2xl font-bold">
        En cuisine avec Yama
      </h2>
      <ul className="grid gap-3 sm:grid-cols-3">
        {recipes.map((r) => (
          <li key={r.slug} className="rounded-xl border border-black/10 p-4">
            <p className="text-5xl" aria-hidden="true">
              {r.emoji}
            </p>
            <h3 className="mt-2 font-semibold">{r.name}</h3>
            <p className="text-sm text-black/60">
              {r.ingredients} ingrédients · {formatXof(r.totalMinor)}
            </p>
            <button type="button" className="mt-3 w-full rounded-full bg-brand-red py-2 text-sm font-medium text-white">
              Ajouter tous les ingrédients
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
