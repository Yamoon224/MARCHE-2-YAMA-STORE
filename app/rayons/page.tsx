import { Suspense } from "react";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts } from "@/lib/api/products";
import { promotions } from "@/lib/mock";

export const metadata = { title: "Nos rayons — Marché de Yama" };

type SearchParams = Promise<{ q?: string | string[] }>;

export default function RayonsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto w-[min(1200px,calc(100%-28px))] py-8">
      <Suspense fallback={<p className="text-black/60">Chargement des produits…</p>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  const term = typeof q === "string" ? q.trim() : "";

  const fromApi = await fetchProducts({ q: term || undefined });
  const apiDown = fromApi === null;
  const products = fromApi ?? (term ? [] : promotions);

  return (
    <>
      <h1 className="text-[26px] font-extrabold sm:text-[32px]">{term ? `Résultats pour « ${term} »` : "Tous nos produits"}</h1>

      {apiDown && (
        <p role="status" className="mt-3 rounded-lg bg-white border border-line p-3 text-sm">
          Le catalogue complet est momentanément indisponible. Voici une sélection.
        </p>
      )}

      {products.length === 0 ? (
        <p className="mt-6 text-black/70">Aucun produit ne correspond à votre recherche.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {products.map((product) => (
            <li key={product.id} className="flex justify-center [&>article]:w-full">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
