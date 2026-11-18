"use client";

import { useSearchParams } from "next/navigation";

/** Recherche de l'en-tête : le terme recherché reste affiché dans le champ (relu depuis l'adresse). */
export function SearchForm() {
  const current = useSearchParams().get("q") ?? "";

  return (
    <form
      role="search"
      action="/aisles"
      className="order-last col-span-3 flex h-[52px] rounded-full bg-white p-1 pl-4 md:h-11 md:order-none md:col-span-1"
    >
      {/* key : si la recherche change (retour arrière, nouveau lien), le champ reprend la valeur de l'adresse. */}
      <input
        key={current}
        type="search"
        name="q"
        defaultValue={current}
        placeholder="Rechercher un produit…"
        aria-label="Rechercher un produit"
        enterKeyHint="search"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none sm:text-sm"
      />
      <button type="submit" aria-label="Lancer la recherche" className="w-11 shrink-0 rounded-full bg-brand-green text-lg text-white hover:bg-brand-green-dark">
        ⌕
      </button>
    </form>
  );
}