import { describe, expect, it } from "vitest";
import {
  addLine, EMPTY_CART, formatQuantity, itemCount, lineTotalMinor, removeLine, setQuantity, subtotalMinor, toOrderItems,
  type CartLine,
} from "./cart";

const rice = { productId: 1, name: "Riz 5 kg", saleUnit: "piece" as const, unitPriceMinor: 5500 };
const tomatoes = { productId: 2, name: "Tomates", saleUnit: "kg" as const, unitPriceMinor: 900 };

describe("cart", () => {
  it("adds pieces one by one and weighted products by 250 g", () => {
    let cart = addLine(EMPTY_CART, rice);
    cart = addLine(cart, rice);
    cart = addLine(cart, tomatoes);

    expect(cart.lines.find((l) => l.productId === 1)?.quantity).toBe(2);
    expect(cart.lines.find((l) => l.productId === 2)?.quantity).toBe(250);
  });

  it("sets and removes quantities, and drops lines at zero or below", () => {
    let cart = addLine(EMPTY_CART, rice, 3);
    cart = setQuantity(cart, rice, 5);
    expect(cart.lines[0].quantity).toBe(5);

    expect(setQuantity(cart, rice, 0).lines).toEqual([]);
    expect(setQuantity(cart, rice, -2).lines).toEqual([]);
    expect(setQuantity(cart, rice, Number.NaN).lines).toEqual([]);
    expect(removeLine(cart, 1).lines).toEqual([]);
  });

  it("ignores fractional and absurd quantities", () => {
    expect(setQuantity(EMPTY_CART, rice, 2.9).lines[0].quantity).toBe(2);
    expect(setQuantity(EMPTY_CART, rice, 9e12).lines[0].quantity).toBe(1_000_000);
  });

  it("never mutates the previous cart", () => {
    const before = addLine(EMPTY_CART, rice);
    const snapshot = JSON.stringify(before);

    addLine(before, tomatoes);
    removeLine(before, 1);

    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it("keeps lines in a stable order", () => {
    const cart = addLine(addLine(EMPTY_CART, tomatoes), rice);

    expect(cart.lines.map((l) => l.productId)).toEqual([1, 2]);
  });
});

describe("totals", () => {
  const line = (over: Partial<CartLine>): CartLine => ({ ...rice, quantity: 1, ...over });

  it("matches the server rounding for weighted products", () => {
    // 900 F CFA / kg, mêmes cas que LineTotalCalculatorTest côté backend
    expect(lineTotalMinor(line({ ...tomatoes, quantity: 1000 }))).toBe(900);
    expect(lineTotalMinor(line({ ...tomatoes, quantity: 250 }))).toBe(225);
    expect(lineTotalMinor(line({ ...tomatoes, quantity: 1500 }))).toBe(1350);
    expect(lineTotalMinor(line({ ...tomatoes, quantity: 1 }))).toBe(1);
    expect(lineTotalMinor(line({ ...tomatoes, quantity: 333 }))).toBe(300);
  });

  it("multiplies pieces and sums the cart", () => {
    let cart = addLine(EMPTY_CART, rice, 2);
    cart = addLine(cart, tomatoes, 1500);

    expect(subtotalMinor(cart)).toBe(11000 + 1350);
    expect(itemCount(cart)).toBe(2);
  });

  it("only sends ids and quantities to the server", () => {
    const cart = addLine(EMPTY_CART, rice, 2);

    expect(toOrderItems(cart)).toEqual([{ product_id: 1, quantity: 2 }]);
  });
});

describe("formatQuantity", () => {
  it.each([
    [{ saleUnit: "piece", quantity: 1 }, "1 pièce"],
    [{ saleUnit: "piece", quantity: 3 }, "3 pièces"],
    [{ saleUnit: "kg", quantity: 750 }, "750 g"],
    [{ saleUnit: "kg", quantity: 1500 }, "1,5 kg"],
    [{ saleUnit: "l", quantity: 500 }, "500 ml"],
    [{ saleUnit: "l", quantity: 2000 }, "2 l"],
  ] as const)("%j -> %s", (input, expected) => {
    expect(formatQuantity(input)).toBe(expected);
  });
});
