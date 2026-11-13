import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { CartProvider, useCart } from "@/lib/cart/CartProvider";
import type { Product } from "@/lib/mock";
import { ProductCard } from "./ProductCard";

const base: Product = { id: 1, name: "Tomates", emoji: "🍅", priceMinor: 900, unit: "le kg", saleUnit: "kg" };

function CartProbe() {
  const { cart, subtotalMinor } = useCart();
  return <output data-testid="probe">{cart.lines.map((l) => `${l.productId}:${l.quantity}`).join(",")}|{subtotalMinor}</output>;
}

const renderCard = (product: Product) =>
  render(
    <CartProvider>
      <ProductCard product={product} />
      <CartProbe />
    </CartProvider>,
  );

beforeEach(() => window.localStorage.clear());

describe("ProductCard", () => {
  it("affiche le nom, le prix et l'unité", () => {
    renderCard(base);
    expect(screen.getByRole("heading", { name: "Tomates" })).toBeInTheDocument();
    expect(screen.getByText("900 F CFA")).toBeInTheDocument();
    expect(screen.getByText("le kg")).toBeInTheDocument();
  });

  it("affiche l'ancien prix barré en promotion", () => {
    renderCard({ ...base, oldPriceMinor: 1200 });
    expect(screen.getByText("1 200 F CFA")).toHaveClass("line-through");
  });

  it("désactive l'ajout quand le produit est épuisé", () => {
    renderCard({ ...base, soldOut: true });
    expect(screen.getByText("Épuisé")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ajouter/ })).toBeDisabled();
  });

  it("ajoute 250 g d'un produit au poids, puis 500 g au second clic", async () => {
    const user = userEvent.setup();
    renderCard(base);

    const button = screen.getByRole("button", { name: "Ajouter 250 g de Tomates au panier" });
    await user.click(button);
    expect(screen.getByTestId("probe")).toHaveTextContent("1:250|225");

    await user.click(button);
    expect(screen.getByTestId("probe")).toHaveTextContent("1:500|450");
  });

  it("ajoute une pièce à la fois pour un produit à l'unité", async () => {
    const user = userEvent.setup();
    renderCard({ ...base, id: 2, saleUnit: "piece", unit: "la pièce", priceMinor: 5500 });

    await user.click(screen.getByRole("button", { name: "Ajouter 1 pièce de Tomates au panier" }));

    expect(screen.getByTestId("probe")).toHaveTextContent("2:1|5500");
  });

  it("garde le panier après un rechargement de la page", async () => {
    const user = userEvent.setup();
    const first = renderCard(base);
    await user.click(screen.getByRole("button", { name: /Ajouter/ }));
    first.unmount();

    renderCard(base);

    expect(await screen.findByTestId("probe")).toHaveTextContent("1:250|225");
  });
});
