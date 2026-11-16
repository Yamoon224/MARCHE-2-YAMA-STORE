import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { fetchCategories } from "@/lib/api/content";
import { fetchProducts } from "@/lib/api/products";

/** Liste de produits d'un rayon et/ou d'une recherche, lue dans l'API (aucune donnée de remplacement). */
export async function ProductResults({ term, categorySlug }: { term: string; categorySlug?: string }) {
  const [products, categories] = await Promise.all([
    fetchProducts({ q: term || undefined, category: categorySlug, perPage: 50 }),
    fetchCategories(),
  ]);

  const category = categorySlug ? categories?.find((c) => c.slug === categorySlug) : undefined;
  const title = term ? `Résultats pour « ${term} »` : (category?.name ?? "Tous nos produits");

  return (
    <>
      <h1 className="text-[26px] font-extrabold sm:text-[32px]">{title}</h1>

      {categories && categories.length > 0 && (
        <nav aria-label="Rayons" className="mt-4 flex flex-wrap gap-2">
          <Link href="/rayons" className={chip(!categorySlug)}>
            Tout
          </Link>
          {categories.map((c) => (
            <Link key={c.slug} href={`/rayons/${c.slug}`} className={chip(c.slug === categorySlug)}>
              {c.name}
            </Link>
          ))}
        </nav>
      )}

      {products === null ? (
        <p role="status" className="mt-6 rounded-lg border border-line bg-white p-3 text-sm">
          Le catalogue est momentanément indisponible. Réessayez dans un instant.
        </p>
      ) : products.length === 0 ? (
        <p className="mt-6 text-muted">Aucun produit ne correspond à votre recherche.</p>
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

const chip = (on: boolean) =>
  `rounded-full border px-4 py-2 text-[13px] font-bold ${on ? "border-brand-green bg-brand-green text-white" : "border-line bg-white hover:border-brand-green"}`;