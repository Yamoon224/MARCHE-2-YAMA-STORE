import { connection } from "next/server";
import { Suspense } from "react";
import { CategoryGrid } from "@/components/CategoryGrid";
import { Hero } from "@/components/Hero";
import { ProductRail } from "@/components/ProductRail";
import { RecipeSection } from "@/components/RecipeSection";
import { fetchBanners, fetchCategories, fetchRecipes } from "@/lib/api/content";
import { fetchProducts } from "@/lib/api/products";

// Tout le contenu vient de l'API. Chaque section se charge en flux et disparaît si l'API ne répond pas :
// le build n'appelle jamais l'API et aucune donnée de remplacement n'est affichée.
export default function Home() {
  return (
    <main>
      <Suspense fallback={<Hero banners={[]} />}>
        <LiveHero />
      </Suspense>
      <Suspense>
        <LiveCategories />
      </Suspense>
      <Suspense>
        <LiveRail id="promos" title="Les bons plans Yama" query={{ promo: true, perPage: 12 }} />
      </Suspense>
      <Suspense>
        <LiveRail id="best" title="Les best sellers" query={{ featured: true, perPage: 12 }} />
      </Suspense>
      <Suspense>
        <LiveRecipes />
      </Suspense>
    </main>
  );
}

async function LiveHero() {
  await connection();
  return <Hero banners={(await fetchBanners()) ?? []} />;
}

async function LiveCategories() {
  await connection();
  return <CategoryGrid categories={(await fetchCategories()) ?? []} />;
}

async function LiveRail({ id, title, query }: { id: string; title: string; query: Parameters<typeof fetchProducts>[0] }) {
  await connection();
  const products = await fetchProducts(query);

  if (products === null) {
    return id === "promos" ? (
      <p role="status" className="mx-auto my-8 w-[min(1200px,calc(100%-28px))] rounded-lg border border-line bg-white p-4 text-sm">
        Le catalogue est momentanément indisponible. Réessayez dans un instant.
      </p>
    ) : null;
  }

  return products.length > 0 ? <ProductRail id={id} title={title} href="/rayons" products={products} /> : null;
}

async function LiveRecipes() {
  await connection();
  return <RecipeSection recipes={(await fetchRecipes()) ?? []} />;
}