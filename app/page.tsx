import { connection } from "next/server";
import { Suspense } from "react";
import { CategoryGrid } from "@/components/CategoryGrid";
import { DeliveryBanner } from "@/components/DeliveryBanner";
import { Hero } from "@/components/Hero";
import { ProductList } from "@/components/ProductList";
import { ProductRail } from "@/components/ProductRail";
import { RecipeSection } from "@/components/RecipeSection";
import { fetchBanners, fetchCategories, fetchRecipes } from "@/lib/api/content";
import { fetchProducts } from "@/lib/api/products";

// Tout le contenu vient de l'API. Chaque section se charge en flux et disparaît si l'API ne répond pas :
// le build n'appelle jamais l'API et aucune donnée de remplacement n'est affichée.
export default function Home() {
  return (
    <main>
      <Suspense>
        <LiveHero />
      </Suspense>
      <Suspense>
        <LiveCategories />
      </Suspense>
      <Suspense>
        <LiveRecipes />
      </Suspense>
      <Suspense>
        <LiveRail
          id="huiles"
          title="Nos huiles & beurres"
          subtitle="Des indispensables pour cuisiner et prendre soin de soi."
          href="/rayons?q=huile"
          query={{ q: "huile", perPage: 4 }}
        />
      </Suspense>
      <Suspense>
        <LiveRail id="populaires" title="Produits populaires" subtitle="Les indispensables de votre cuisine." href="/rayons" query={{ featured: true, perPage: 4 }} />
      </Suspense>
      <Suspense>
        <LiveRail id="promos" title="Les bons plans Yama" subtitle="Des prix en baisse, tant qu'il y en a." href="/rayons" query={{ promo: true, perPage: 4 }} />
      </Suspense>
      <DeliveryBanner />
      <Suspense>
        <LiveCatalogue />
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

async function LiveRail({
  id,
  title,
  subtitle,
  href,
  query,
}: {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  query: Parameters<typeof fetchProducts>[0];
}) {
  await connection();
  const products = await fetchProducts(query);

  if (products === null) {
    return id === "populaires" ? (
      <p role="status" className="mx-auto my-8 w-[min(1200px,calc(100%-28px))] rounded-lg border border-line bg-white p-4 text-sm">
        Le catalogue est momentanément indisponible. Réessayez dans un instant.
      </p>
    ) : null;
  }

  return products.length > 0 ? <ProductRail id={id} title={title} subtitle={subtitle} href={href} products={products} /> : null;
}

async function LiveRecipes() {
  await connection();
  return <RecipeSection recipes={(await fetchRecipes()) ?? []} />;
}

async function LiveCatalogue() {
  await connection();
  const products = await fetchProducts({ perPage: 20 });

  return products && products.length > 0 ? (
    <ProductList id="catalogue" title="Tous nos produits" subtitle="Retrouvez facilement vos essentiels et spécialités africaines." products={products} />
  ) : null;
}
