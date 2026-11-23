import type { Product } from "@/lib/catalog/types";
import { api, type ApiClient } from "./client";
import type { components } from "./schema";

type ApiProduct = components["schemas"]["Product"];

const UNIT_LABEL: Record<ApiProduct["sale_unit"], string> = {
  piece: "la pièce",
  kg: "le kg",
  l: "le litre",
};

/** URLs de la galerie : couverture en premier, puis l'ordre choisi dans le backoffice. */
function galleryUrls(p: ApiProduct): string[] {
  return [...(p.images ?? [])]
    .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.position - b.position)
    .map((image) => image.url)
    .filter(Boolean);
}

function toProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    imageUrl: p.cover ?? p.image_url ?? null,
    images: galleryUrls(p),
    description: p.description ?? null,
    categoryId: p.category_id,
    priceMinor: p.price_minor,
    oldPriceMinor: p.compare_at_price_minor ?? undefined,
    unit: UNIT_LABEL[p.sale_unit],
    saleUnit: p.sale_unit,
  };
}

const CATALOG_TIMEOUT_MS = 3000;

export type ProductQuery = {
  q?: string;
  categoryId?: number;
  /** Slug du rayon. */
  category?: string;
  featured?: boolean;
  promo?: boolean;
  page?: number;
  perPage?: number;
};

export type ProductPage = { products: Product[]; page: number; lastPage: number; total: number };

/** Une page de produits avec sa pagination, ou `null` si l'API est injoignable (l'appelant affiche alors un état d'indisponibilité). */
export async function fetchProductPage(query?: ProductQuery, client: ApiClient = api): Promise<ProductPage | null> {
  try {
    const { data, error } = await client.GET("/api/v1/products", {
      params: {
        query: {
          q: query?.q,
          category_id: query?.categoryId,
          category: query?.category,
          featured: query?.featured,
          promo: query?.promo,
          page: query?.page,
          per_page: query?.perPage,
        },
      },
      cache: "no-store",
      // Une API lente ne doit jamais bloquer le rendu ni le build.
      signal: AbortSignal.timeout(CATALOG_TIMEOUT_MS),
    });
    if (error || !data) return null;

    return {
      products: data.data.map(toProduct),
      page: data.meta?.current_page ?? 1,
      lastPage: data.meta?.last_page ?? 1,
      total: data.meta?.total ?? data.data.length,
    };
  } catch {
    return null;
  }
}

/** Produits de l'API (première page par défaut), ou `null` si l'API est injoignable. */
export async function fetchProducts(query?: ProductQuery, client: ApiClient = api): Promise<Product[] | null> {
  return (await fetchProductPage(query, client))?.products ?? null;
}
/** Une fiche produit : `null` si l'API est injoignable ou si le produit n'existe pas (ou plus). */
export async function fetchProduct(slug: string, client: ApiClient = api): Promise<Product | null> {
  try {
    const { data, error } = await client.GET("/api/v1/products/{slug}", {
      params: { path: { slug } },
      cache: "no-store",
      signal: AbortSignal.timeout(CATALOG_TIMEOUT_MS),
    });
    return error || !data?.data ? null : toProduct(data.data);
  } catch {
    return null;
  }
}