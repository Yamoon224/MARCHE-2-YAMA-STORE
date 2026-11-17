import type { Banner, Category, Recipe } from "@/lib/catalog/types";
import { api, type ApiClient } from "./client";

const TIMEOUT_MS = 3000;
const REQUEST = { next: { revalidate: 60 } } as const;
const signal = () => AbortSignal.timeout(TIMEOUT_MS);

/** Rayons actifs, ou `null` si l'API est injoignable. */
export async function fetchCategories(client: ApiClient = api): Promise<Category[] | null> {
  try {
    const { data, error } = await client.GET("/api/v1/categories", { ...REQUEST, signal: signal() });
    if (error || !data) return null;
    return (data.data ?? []).map((c) => ({ id: c.id, slug: c.slug, name: c.name, icon: c.icon, imageUrl: c.image_url, showOnHome: c.show_on_home ?? false, homeTitle: c.home_title, homeSubtitle: c.home_subtitle }));
  } catch {
    return null;
  }
}

/** Bannières du carrousel d'accueil, ou `null` si l'API est injoignable. */
export async function fetchBanners(client: ApiClient = api): Promise<Banner[] | null> {
  try {
    const { data, error } = await client.GET("/api/v1/banners", { ...REQUEST, signal: signal() });
    if (error || !data) return null;
    return (data.data ?? []).map((b) => ({
      id: b.id, title: b.title, eyebrow: b.eyebrow, text: b.text, ctaLabel: b.cta_label, ctaUrl: b.cta_url, imageUrl: b.image_url,
    }));
  } catch {
    return null;
  }
}

/** Recettes avec leurs ingrédients, ou `null` si l'API est injoignable. */
export async function fetchRecipes(client: ApiClient = api): Promise<Recipe[] | null> {
  try {
    const { data, error } = await client.GET("/api/v1/recipes", { ...REQUEST, signal: signal() });
    if (error || !data) return null;
    return (data.data ?? []).map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      icon: r.icon,
      imageUrl: r.image_url,
      totalMinor: r.total_minor,
      ingredients: r.items.map((i) => ({
        productId: i.product_id, name: i.name, saleUnit: i.sale_unit, unitPriceMinor: i.unit_price_minor, quantity: i.quantity,
      })),
    }));
  } catch {
    return null;
  }
}