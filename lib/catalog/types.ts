import type { SaleUnit } from "@/lib/cart/cart";

export type Product = {
  id: number;
  slug: string;
  name: string;
  imageUrl?: string | null;
  description?: string | null;
  categoryId?: number;
  priceMinor: number;
  /** Ancien prix : présent uniquement pour un produit en promotion. */
  oldPriceMinor?: number;
  unit: string;
  saleUnit: SaleUnit;
  soldOut?: boolean;
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  icon?: string | null;
  imageUrl?: string | null;
  /** Rayon affiché comme section de l'accueil (titre et sous-titre pilotés depuis le backoffice). */
  showOnHome: boolean;
  homeTitle?: string | null;
  homeSubtitle?: string | null;
};

export type Banner = { id: number; title: string; eyebrow?: string | null; text?: string | null; ctaLabel: string; ctaUrl: string; imageUrl?: string | null };

export type RecipeIngredient = {
  productId: number;
  name: string;
  saleUnit: SaleUnit;
  unitPriceMinor: number;
  /** Unité de base : pièces, grammes ou millilitres. */
  quantity: number;
};

export type Recipe = {
  id: number;
  slug: string;
  name: string;
  icon?: string | null;
  imageUrl?: string | null;
  totalMinor: number;
  ingredients: RecipeIngredient[];
};