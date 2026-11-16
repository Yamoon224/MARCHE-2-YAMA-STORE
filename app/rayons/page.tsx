import { Suspense } from "react";
import { ProductResults } from "@/components/catalog/ProductResults";

export const metadata = { title: "Nos rayons — Marché de Yama" };

type SearchParams = Promise<{ q?: string | string[] }>;

export default function RayonsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto w-[min(1200px,calc(100%-28px))] py-8">
      <Suspense fallback={<p className="text-muted">Chargement des produits…</p>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;

  return <ProductResults term={typeof q === "string" ? q.trim() : ""} />;
}