"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import {
  addLine, EMPTY_CART, removeLine, setQuantity as setLineQuantity, subtotalMinor, itemCount,
  type Cart, type CartLine,
} from "./cart";

const STORAGE_KEY = "yama.cart.v1";

type LineInput = Omit<CartLine, "quantity">;

type CartContextValue = {
  cart: Cart;
  /** Faux tant que le panier n'est pas relu depuis le navigateur (évite un affichage erroné au premier rendu). */
  ready: boolean;
  subtotalMinor: number;
  itemCount: number;
  add: (line: LineInput, quantity?: number) => void;
  setQuantity: (line: LineInput, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Le panier vit dans localStorage (ce n'est pas une donnée sensible : ni jeton ni identité) et survit
 * à une coupure réseau. `useSyncExternalStore` le lit sans double rendu et le synchronise entre onglets.
 */
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedCart: Cart = EMPTY_CART;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // navigation privée ou stockage bloqué
  }
}

function getSnapshot(): Cart {
  const raw = readRaw();

  // Même chaîne => même objet : indispensable pour que useSyncExternalStore ne boucle pas.
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed = JSON.parse(raw ?? "null");
      cachedCart = Array.isArray(parsed?.lines) ? (parsed as Cart) : EMPTY_CART;
    } catch {
      cachedCart = EMPTY_CART;
    }
  }

  return cachedCart;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function write(cart: Cart): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Stockage indisponible : le panier ne survivra pas au rechargement.
  }
  listeners.forEach((listener) => listener());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_CART);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);

  const update = useCallback((next: (current: Cart) => Cart) => write(next(getSnapshot())), []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      ready,
      subtotalMinor: subtotalMinor(cart),
      itemCount: itemCount(cart),
      add: (line, quantity) => update((c) => addLine(c, line, quantity)),
      setQuantity: (line, quantity) => update((c) => setLineQuantity(c, line, quantity)),
      remove: (productId) => update((c) => removeLine(c, productId)),
      clear: () => update(() => EMPTY_CART),
    }),
    [cart, ready, update],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart doit être utilisé dans un <CartProvider>.");
  return context;
}
