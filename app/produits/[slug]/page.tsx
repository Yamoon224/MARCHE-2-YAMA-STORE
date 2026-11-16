import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { fetchCategories } from "@/lib/api/content";
import { fetchProduct } from "@/lib/api/products";
import { formatXof } from "@/lib/format";

export const metadata = { title: "Produit — Marché de Yama" };

type Params = Promise<{ slug: string }>;

export default function ProductPage({ params }: { params: Params }) {
  return (
    <main className="mx-auto w-[min(1200px,calc(100%-28px))] py-8">
      <Suspense fallback={<p className="text-muted">Chargement du produit…</p>}>
        <Detail params={params} />
      </Suspense>
    </main>
  );
}

async function Detail({ params }: { params: Params }) {
  await connection();
  const { slug } = await params;
  const [product, categories] = await Promise.all([fetchProduct(slug), fetchCategories()]);

  if (!product) notFound();

  const category = categories?.find((c) => c.id === product.categoryId);
  const promo = product.oldPriceMinor && product.oldPriceMinor > product.priceMinor;

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="mb-4 text-[13px] text-muted">
        <Link href="/" className="hover:underline">Accueil</Link> ›{" "}
        {category ? (
          <>
            <Link href={`/rayons/${category.slug}`} className="hover:underline">{category.name}</Link> ›{" "}
          </>
        ) : null}
        <span aria-current="page">{product.name}</span>
      </nav>
      <section className="grid gap-8 md:grid-cols-2">
        <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-[22px] bg-[#f4ecd9] text-8xl shadow-soft">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- images de l'API, domaines inconnus à la compilation
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden="true">🛒</span>
          )}
        </div>
        <div className="flex flex-col items-start gap-3">
          <h1 className="text-[clamp(28px,3.4vw,40px)] font-extrabold">{product.name}</h1>
          <p className="font-display text-3xl font-extrabold text-brand-red">
            {formatXof(product.priceMinor)} <span className="text-base font-normal text-muted">{product.unit}</span>
            {promo && <s className="ml-3 text-lg font-normal text-muted">{formatXof(product.oldPriceMinor!)}</s>}
          </p>
          {product.description && <p className="max-w-[46ch] text-[#444b44]">{product.description}</p>}
          <div className="w-full max-w-60">
            <AddToCartButton product={product} />
          </div>
          <ul className="mt-3 grid gap-1.5 text-sm text-muted">
            <li>🚚 Livraison à domicile ou retrait en magasin</li>
            <li>💶 Paiement : mobile money, carte ou espèces à la livraison</li>
          </ul>
        </div>
      </section>
    </>
  );
}