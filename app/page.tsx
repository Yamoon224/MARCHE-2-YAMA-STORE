import { Suspense } from "react";
import { CategoryGrid } from "@/components/CategoryGrid";
import { Hero } from "@/components/Hero";
import { ProductRail } from "@/components/ProductRail";
import { RecipeSection } from "@/components/RecipeSection";
import { fetchProducts } from "@/lib/api/products";
import { bestSellers, promotions } from "@/lib/mock";

export default function Home() {
  return (
    <main>
      <Hero />
      <CategoryGrid />
      {/* Le catalogue réel arrive en flux ; en attendant (ou si l'API est indisponible) on montre la sélection. */}
      <Suspense fallback={<PromoRail products={promotions} />}>
        <LivePromoRail />
      </Suspense>
      <ProductRail id="best" title="Les best sellers" href="/rayons" products={bestSellers} />
      <RecipeSection />
    </main>
  );
}

function PromoRail({ products }: { products: typeof promotions }) {
  return <ProductRail id="promos" title="Les bons plans Yama" href="/rayons" products={products} />;
}

async function LivePromoRail() {
  const fromApi = await fetchProducts();

  return <PromoRail products={fromApi && fromApi.length > 0 ? fromApi : promotions} />;
}
