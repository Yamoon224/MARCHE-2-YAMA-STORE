import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductGallery } from "@/components/ProductGallery";
import { fetchCategories } from "@/lib/api/content";
import { fetchProduct } from "@/lib/api/products";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Produit - Marché de Yama" };

type Params = Promise<{ slug: string }>;

export default function ProductPage({ params }: { params: Params }) {
  return (
    <main className="mx-auto w-[min(1200px,calc(100%-28px))] py-5 sm:py-8">
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
      <nav aria-label="Fil d'Ariane" className="mb-3 text-[13px] leading-6 text-muted sm:mb-4">
        <Link href="/" className="hover:underline">Accueil</Link> ›{" "}
        {category ? (
          <>
            <Link href={`/aisles/${category.slug}`} className="hover:underline">{category.name}</Link> ›{" "}
          </>
        ) : null}
        <span aria-current="page">{product.name}</span>
      </nav>
      <section className="grid gap-5 md:grid-cols-2 md:gap-8">
        <ProductGallery images={galleryOf(product)} name={product.name} />
        <div className="flex flex-col items-start gap-3">
          <h1 className="text-[clamp(28px,3.4vw,40px)] font-extrabold">{product.name}</h1>
          <p className="font-display text-[28px] font-extrabold text-brand-red sm:text-3xl">
            {formatMoney(product.priceMinor)} <span className="text-base font-normal text-muted">{product.unit}</span>
            {promo && <s className="ml-3 text-lg font-normal text-muted">{formatMoney(product.oldPriceMinor!)}</s>}
          </p>
          {product.description && <p className="max-w-[46ch] text-[#444b44]">{product.description}</p>}
          <div className="w-full sm:max-w-60">
            <AddToCartButton product={product} />
          </div>
          <ul className="mt-3 grid gap-1.5 text-sm text-muted">
            <li>🚚 Livraison à Paris et en Île-de-France</li>
            <li>💳 Carte Visa / Mastercard ou espèces à la réception</li>
          </ul>
        </div>
      </section>
    </>
  );
}

/** Photos à montrer : la galerie si l'API en fournit, sinon la seule image de couverture. */
function galleryOf(product: { images?: string[]; imageUrl?: string | null }): string[] {
  const list = product.images?.filter(Boolean) ?? [];
  if (list.length > 0) return list;
  return product.imageUrl ? [product.imageUrl] : [];
}
