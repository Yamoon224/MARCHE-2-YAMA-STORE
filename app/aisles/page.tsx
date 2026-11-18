import { Suspense } from "react";
import { ProductResults } from "@/components/catalog/ProductResults";
import { toPage } from "@/lib/catalog/pagination";

export const metadata = { title: "Nos rayons - Marché de Yama" };

type SearchParams = Promise<{ q?: string | string[]; page?: string | string[] }>;

export default function RayonsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto w-[min(1200px,calc(100%-28px))] py-5 sm:py-8">
      <Suspense fallback={<p className="text-muted">Chargement des produits…</p>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const { q, page } = await searchParams;

  return <ProductResults term={typeof q === "string" ? q.trim() : ""} page={toPage(page)} />;
}