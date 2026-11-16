import { describe, expect, it } from "vitest";
import { createApiClient } from "./client";
import { fetchProduct, fetchProducts } from "./products";

const apiProduct = {
  id: 7, category_id: 1, sku: "FL-001", barcode: null, name: "Tomates", slug: "tomates", description: null,
  sale_unit: "kg", is_weight_variable: true, price_minor: 900, vat_rate_bp: 0, perishable: true, is_active: true, image_url: null, compare_at_price_minor: null, is_featured: false,
};

const clientWith = (fetchImpl: typeof fetch) => createApiClient({ baseUrl: "http://api.test", fetch: fetchImpl });

describe("fetchProducts", () => {
  it("convertit les produits de l'API pour l'affichage", async () => {
    const client = clientWith(async () => Response.json({ data: [apiProduct] }));

    expect(await fetchProducts(undefined, client)).toEqual([
      { id: 7, slug: "tomates", name: "Tomates", imageUrl: null, description: null, categoryId: 1, priceMinor: 900, oldPriceMinor: undefined, unit: "le kg", saleUnit: "kg" },
    ]);
  });

  it("transmet la recherche et la catégorie", async () => {
    let url = "";
    const client = clientWith(async (input) => {
      url = (input as Request).url;
      return Response.json({ data: [] });
    });

    await fetchProducts({ q: "riz", categoryId: 2 }, client);

    expect(url).toContain("q=riz");
    expect(url).toContain("category_id=2");
  });

  it("convertit l'image et l'ancien prix d'une promotion", async () => {
    const client = clientWith(async () => Response.json({ data: [{ ...apiProduct, image_url: "http://img/t.jpg", compare_at_price_minor: 1200 }] }));

    expect(await fetchProducts(undefined, client)).toMatchObject([{ imageUrl: "http://img/t.jpg", oldPriceMinor: 1200 }]);
  });

  it("transmet les filtres rayon, mis en avant et promotion", async () => {
    let url = "";
    const client = clientWith(async (input) => {
      url = (input as Request).url;
      return Response.json({ data: [] });
    });

    await fetchProducts({ category: "epicerie", featured: true, promo: true, perPage: 12 }, client);

    expect(url).toContain("category=epicerie");
    expect(url).toContain("featured=true");
    expect(url).toContain("promo=true");
    expect(url).toContain("per_page=12");
  });

  it("retourne null si l'API est injoignable", async () => {
    const client = clientWith(async () => {
      throw new Error("réseau");
    });

    expect(await fetchProducts(undefined, client)).toBeNull();
  });

  it("retourne null sur erreur HTTP", async () => {
    const client = clientWith(async () => Response.json({ message: "boom" }, { status: 500 }));

    expect(await fetchProducts(undefined, client)).toBeNull();
  });

  it("abandonne une API trop lente au lieu de bloquer le rendu", async () => {
    const client = clientWith((input, init) =>
      new Promise((_resolve, reject) => {
        // Se comporte comme fetch : rejette quand le signal d'annulation se déclenche.
        const signal = (input as Request).signal ?? init?.signal;
        signal.addEventListener("abort", () => reject(new DOMException("timeout", "TimeoutError")));
      }),
    );

    const started = Date.now();
    const result = await fetchProducts(undefined, client);

    expect(result).toBeNull();
    expect(Date.now() - started).toBeLessThan(5000);
  }, 8000);
});

describe("fetchProduct", () => {
  it("lit une fiche par son slug", async () => {
    let url = "";
    const client = clientWith(async (input) => {
      url = (input as Request).url;
      return Response.json({ data: { ...apiProduct, description: "Frais", image_url: null, compare_at_price_minor: null, is_featured: false } });
    });

    expect(await fetchProduct("tomates", client)).toMatchObject({ id: 7, name: "Tomates", description: "Frais" });
    expect(url).toContain("/api/v1/products/tomates");
  });

  it("retourne null pour un produit inconnu ou une API en panne", async () => {
    expect(await fetchProduct("absent", clientWith(async () => Response.json({ message: "x" }, { status: 404 })))).toBeNull();
    expect(await fetchProduct("x", clientWith(async () => { throw new Error("réseau"); }))).toBeNull();
  });
});