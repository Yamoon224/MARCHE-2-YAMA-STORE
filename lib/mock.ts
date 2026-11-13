export type Product = {
  id: number;
  name: string;
  emoji: string;
  priceMinor: number;
  oldPriceMinor?: number;
  unit: string;
  saleUnit: "piece" | "kg" | "l";
  soldOut?: boolean;
};

export const categories = [
  { slug: "fruits-legumes", name: "Fruits et légumes", emoji: "🥬" },
  { slug: "boucherie-poissonnerie", name: "Boucherie et poissonnerie", emoji: "🥩" },
  { slug: "frais-laitiers", name: "Frais et laitiers", emoji: "🧀" },
  { slug: "boulangerie", name: "Boulangerie", emoji: "🥖" },
  { slug: "epicerie", name: "Épicerie", emoji: "🍚" },
  { slug: "boissons", name: "Boissons", emoji: "🥤" },
  { slug: "surgeles", name: "Surgelés", emoji: "🧊" },
  { slug: "bebe", name: "Bébé", emoji: "🍼" },
  { slug: "hygiene-beaute", name: "Hygiène et beauté", emoji: "🧴" },
  { slug: "entretien-maison", name: "Entretien et maison", emoji: "🧽" },
];

export const promotions: Product[] = [
  { id: 1, name: "Tomates fraîches", emoji: "🍅", priceMinor: 900, oldPriceMinor: 1200, saleUnit: "kg", unit: "le kg" },
  { id: 2, name: "Riz parfumé 5 kg", emoji: "🍚", priceMinor: 5500, oldPriceMinor: 6200, saleUnit: "piece", unit: "le sac" },
  { id: 3, name: "Huile végétale 1 L", emoji: "🫒", priceMinor: 1500, oldPriceMinor: 1800, saleUnit: "piece", unit: "la bouteille" },
  { id: 4, name: "Poulet entier", emoji: "🍗", priceMinor: 3800, saleUnit: "kg", unit: "le kg" },
  { id: 5, name: "Banane plantain", emoji: "🍌", priceMinor: 700, saleUnit: "kg", unit: "le kg" },
];

export const bestSellers: Product[] = [
  { id: 6, name: "Oignons", emoji: "🧅", priceMinor: 800, saleUnit: "kg", unit: "le kg" },
  { id: 7, name: "Poisson capitaine", emoji: "🐟", priceMinor: 4500, saleUnit: "kg", unit: "le kg" },
  { id: 8, name: "Attiéké", emoji: "🥣", priceMinor: 500, saleUnit: "piece", unit: "la portion" },
  { id: 9, name: "Lait entier 1 L", emoji: "🥛", priceMinor: 1100, saleUnit: "piece", unit: "la brique" },
  { id: 10, name: "Eau minérale 1,5 L", emoji: "💧", priceMinor: 400, saleUnit: "piece", unit: "la bouteille", soldOut: true },
];

export const recipes = [
  { slug: "sauce-graine", name: "Sauce graine", emoji: "🍲", ingredients: 7, totalMinor: 9800 },
  { slug: "kedjenou", name: "Kèdjenou de poulet", emoji: "🍗", ingredients: 6, totalMinor: 8400 },
  { slug: "alloco-poisson", name: "Alloco et poisson braisé", emoji: "🍌", ingredients: 5, totalMinor: 7600 },
];
