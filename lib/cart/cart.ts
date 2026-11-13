export type SaleUnit = "piece" | "kg" | "l";

export type CartLine = {
  productId: number;
  name: string;
  saleUnit: SaleUnit;
  /** Prix TTC par unité de vente (pièce, kg ou litre), en plus petite unité monétaire. */
  unitPriceMinor: number;
  /** Unité de base : pièces, grammes ou millilitres. */
  quantity: number;
};

export type Cart = { lines: CartLine[] };

export const EMPTY_CART: Cart = { lines: [] };

/** Pas d'ajout par unité de vente : 1 pièce, 250 g ou 250 ml. */
export const QUANTITY_STEP: Record<SaleUnit, number> = { piece: 1, kg: 250, l: 250 };

const MAX_LINE_QUANTITY = 1_000_000;

export function addLine(cart: Cart, line: Omit<CartLine, "quantity">, quantity = QUANTITY_STEP[line.saleUnit]): Cart {
  return setQuantity(cart, line, (find(cart, line.productId)?.quantity ?? 0) + quantity);
}

export function setQuantity(cart: Cart, line: Omit<CartLine, "quantity">, quantity: number): Cart {
  const rest = cart.lines.filter((l) => l.productId !== line.productId);
  const safe = Math.min(Math.floor(quantity), MAX_LINE_QUANTITY);

  if (!Number.isFinite(safe) || safe <= 0) return { lines: rest };

  return { lines: [...rest, { ...line, quantity: safe }].sort((a, b) => a.productId - b.productId) };
}

export function removeLine(cart: Cart, productId: number): Cart {
  return { lines: cart.lines.filter((l) => l.productId !== productId) };
}

export function find(cart: Cart, productId: number): CartLine | undefined {
  return cart.lines.find((l) => l.productId === productId);
}

/** Même règle d'arrondi que le serveur : entiers, arrondi à l'unité monétaire la plus proche. */
export function lineTotalMinor(line: CartLine): number {
  if (line.saleUnit === "piece") return line.unitPriceMinor * line.quantity;
  return Math.floor((line.unitPriceMinor * line.quantity + 500) / 1000);
}

export function subtotalMinor(cart: Cart): number {
  return cart.lines.reduce((sum, l) => sum + lineTotalMinor(l), 0);
}

/** Nombre d'articles distincts affiché sur le panier. */
export function itemCount(cart: Cart): number {
  return cart.lines.length;
}

/** Le serveur recalcule les prix : on n'envoie que identifiants et quantités. */
export function toOrderItems(cart: Cart): { product_id: number; quantity: number }[] {
  return cart.lines.map((l) => ({ product_id: l.productId, quantity: l.quantity }));
}

/** "2 pièces", "750 g", "1,5 kg", "500 ml", "1,25 l". */
export function formatQuantity(line: Pick<CartLine, "saleUnit" | "quantity">): string {
  if (line.saleUnit === "piece") return `${line.quantity} ${line.quantity > 1 ? "pièces" : "pièce"}`;

  const unit = line.saleUnit === "kg" ? { small: "g", big: "kg" } : { small: "ml", big: "l" };
  if (line.quantity < 1000) return `${line.quantity} ${unit.small}`;

  return `${(line.quantity / 1000).toLocaleString("fr-FR")} ${unit.big}`;
}
