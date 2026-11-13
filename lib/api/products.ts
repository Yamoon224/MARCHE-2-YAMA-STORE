import type { Product } from "@/lib/mock";
import { api, type ApiClient } from "./client";
import type { components } from "./schema";

type ApiProduct = components["schemas"]["Product"];

const UNIT_LABEL: Record<ApiProduct["sale_unit"], string> = {
  piece: "la pièce",
  kg: "le kg",
  l: "le litre",
};

function toProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    name: p.name,
    emoji: "🛒",
    priceMinor: p.price_minor,
    unit: UNIT_LABEL[p.sale_unit],
    saleUnit: p.sale_unit,
  };
}

const CATALOG_TIMEOUT_MS = 3000;

/** Produits de l'API, ou `null` si l'API est injoignable (la page garde alors ses données de repli). */
export async function fetchProducts(
  query?: { q?: string; categoryId?: number },
  client: ApiClient = api,
): Promise<Product[] | null> {
  try {
    const { data, error } = await client.GET("/api/v1/products", {
      params: { query: { q: query?.q, category_id: query?.categoryId } },
      next: { revalidate: 60 },
      // Une API lente ne doit jamais bloquer le rendu ni le build : au-delà, la page garde ses données de repli.
      signal: AbortSignal.timeout(CATALOG_TIMEOUT_MS),
    });
    if (error || !data) return null;
    return data.data.map(toProduct);
  } catch {
    return null;
  }
}
