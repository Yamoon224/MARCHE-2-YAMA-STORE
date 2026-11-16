import { formatMoney } from "@/lib/format";
import type { Recipe } from "@/lib/catalog/types";
import { RecipeAddButton } from "./cart/RecipeAddButton";

export function RecipeSection({ recipes }: { recipes: Recipe[] }) {
  if (recipes.length === 0) return null;

  return (
    <section
      id="recettes"
      className="mx-auto my-8 w-[min(1200px,calc(100%-28px))] rounded-3xl bg-[#eaf4e4] p-4 sm:my-11 sm:p-7"
      aria-labelledby="recettes-titre"
    >
      <h2 id="recettes-titre" className="mb-1 text-[21px] font-extrabold text-[#154d2b] sm:text-[30px]">
        En cuisine avec Yama
      </h2>
      <p className="mb-5 text-sm text-[#3e5a44]">Tous les ingrédients d&apos;un plat, en un clic.</p>
      <ul className="grid gap-3.5 sm:grid-cols-3">
        {recipes.map((r) => (
          <li key={r.slug} className="rounded-[18px] border border-line bg-white p-4">
            <p className="text-5xl" aria-hidden="true">
              {r.icon ?? "🍲"}
            </p>
            <h3 className="mt-2 font-extrabold">{r.name}</h3>
            <p className="text-sm text-muted">
              {r.ingredients.length} ingrédients · {formatMoney(r.totalMinor)}
            </p>
            <RecipeAddButton recipe={r} />
          </li>
        ))}
      </ul>
    </section>
  );
}