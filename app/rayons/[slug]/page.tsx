import { Suspense } from "react";
import { ProductResults } from "@/components/catalog/ProductResults";

export const metadata = { title: "Rayon — Marché de Yama" };

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ q?: string | string[] }>;

export default function RayonPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  return (
    <main className="mx-auto w-[min(1200px,calc(100%-28px))] py-8">
      <Suspense fallback={<p className="text-muted">Chargement des produits…</p>}>
        <Results params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Results({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ slug }, { q }] = await Promise.all([params, searchParams]);

  return <ProductResults term={typeof q === "string" ? q.trim() : ""} categorySlug={slug} />;
}