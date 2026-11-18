import { formatMoney } from "@/lib/format";
import type { Recipe } from "@/lib/catalog/types";
import { RecipeAddButton } from "./cart/RecipeAddButton";
import { ImageWithFallback } from "./ImageWithFallback";
import { SectionHead } from "./SectionHead";

/** « Combos africains » : bloc rouge de la maquette, chaque recette se commande d'un clic. */
export function RecipeSection({ recipes }: { recipes: Recipe[] }) {
  if (recipes.length === 0) return null;

  return (
    <section
      id="combos"
      className="mx-auto my-8 w-[min(1200px,calc(100%-22px))] rounded-[20px] bg-gradient-to-br from-[#bd0019] to-[#e51b30] p-[15px] text-white shadow-[0_12px_26px_#c9001b20] sm:my-9 sm:w-[min(1200px,calc(100%-44px))] sm:rounded-[25px] sm:p-[22px]"
      aria-labelledby="combos-titre"
    >
      <SectionHead id="combos-titre" title="🍲 Nos combos africains" subtitle="Les bons classiques, réunis pour vous." onDark />
      <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
        {recipes.map((r) => (
          <li key={r.slug} className="flex min-w-0 flex-col rounded-[15px] bg-white p-[7px] text-foreground sm:rounded-[18px] sm:p-[9px]">
            {r.imageUrl ? (
              <ImageWithFallback src={r.imageUrl} className="h-[120px] w-full rounded-[10px] sm:h-[145px] sm:rounded-[13px]" />
            ) : (
              <span aria-hidden="true" className="grid h-[120px] w-full place-items-center rounded-[10px] bg-gradient-to-br from-[#fff0d5] to-[#f3d49b] text-6xl sm:h-[145px] sm:rounded-[13px]">
                {r.icon ?? "🍲"}
              </span>
            )}
            <div className="flex flex-1 flex-col px-[3px] pb-0.5 pt-[9px] sm:px-[5px] sm:pt-[11px]">
              <h3 className="text-[13px] font-extrabold leading-tight sm:text-sm">{r.name}</h3>
              <p className="mt-[3px] text-[11px] leading-[1.4] text-muted sm:text-xs">
                {r.ingredients.length} ingrédient{r.ingredients.length > 1 ? "s" : ""} réunis dans un seul panier.
              </p>
              <p className="my-2 flex-1 text-sm font-extrabold text-brand-red sm:text-base">{formatMoney(r.totalMinor)}</p>
              <RecipeAddButton recipe={r} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
