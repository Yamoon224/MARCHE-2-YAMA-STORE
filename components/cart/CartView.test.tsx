import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { CartProvider, useCart } from "@/lib/cart/CartProvider";
import { CartView } from "./CartView";

function Seed({ saleUnit, quantity }: { saleUnit: "piece" | "kg"; quantity: number }) {
  const { add, ready, cart } = useCart();

  return (
    <>
      <button onClick={() => add({ productId: 1, name: "Tomates", saleUnit, unitPriceMinor: 900 }, quantity)}>seed</button>
      <output data-testid="lines">{ready ? cart.lines.map((l) => `${l.productId}:${l.quantity}`).join(",") : "…"}</output>
    </>
  );
}

const setup = async (saleUnit: "piece" | "kg", quantity: number) => {
  const user = userEvent.setup();
  render(
    <CartProvider>
      <Seed saleUnit={saleUnit} quantity={quantity} />
      <CartView />
    </CartProvider>,
  );
  await user.click(screen.getByText("seed"));
  return user;
};

beforeEach(() => window.localStorage.clear());

describe("CartView quantity", () => {
  it("never removes a line by decreasing: the minimum is one step", async () => {
    const user = await setup("piece", 2);
    const minus = screen.getByRole("button", { name: "Diminuer la quantité de Tomates" });

    await user.click(minus);
    expect(screen.getByTestId("lines")).toHaveTextContent("1:1");
    expect(minus).toBeDisabled();

    await user.click(minus);
    expect(screen.getByTestId("lines")).toHaveTextContent("1:1");
  });

  it("uses 250 g as the minimum for weighed products", async () => {
    const user = await setup("kg", 500);
    const minus = screen.getByRole("button", { name: "Diminuer la quantité de Tomates" });

    await user.click(minus);
    expect(screen.getByTestId("lines")).toHaveTextContent("1:250");
    expect(minus).toBeDisabled();
  });

  it("still removes the product with the dedicated button", async () => {
    const user = await setup("piece", 1);

    await user.click(screen.getByRole("button", { name: "Retirer" }));
    expect(screen.getByText("Votre panier est vide.")).toBeInTheDocument();
  });
});