import { describe, expect, it } from "vitest";
import { addLine, EMPTY_CART } from "@/lib/cart/cart";
import {
  belowMinimum, buildOrderPayload, estimateDeliveryFee, extractApiError, safeNext, validateContact, validateForm,
  type CheckoutForm, type Zone,
} from "./checkout";

const zone: Zone = { id: 3, name: "Paris (75)", fee_minor: 490, free_above_minor: 5000, min_order_minor: 2000 };
const complete: CheckoutForm = {
  fulfillment: "delivery", zoneId: 3, slotId: 9, neighborhood: " 12 rue de Rivoli, 75004 Paris ", landmark: "", phone: "+33 6 12 34 56 78",
};

describe("delivery fee estimate", () => {
  it("charges the zone fee below the free threshold and nothing above or at it", () => {
    expect(estimateDeliveryFee(zone, 4999)).toBe(490);
    expect(estimateDeliveryFee(zone, 5000)).toBe(0);
    expect(estimateDeliveryFee(zone, 20000)).toBe(0);
  });

  it("charges the fee when the zone has no free threshold, and nothing without a zone", () => {
    expect(estimateDeliveryFee({ ...zone, free_above_minor: null }, 999999)).toBe(490);
    expect(estimateDeliveryFee(undefined, 500)).toBe(0);
  });

  it("detects an order below the zone minimum", () => {
    expect(belowMinimum(zone, 1999)).toBe(true);
    expect(belowMinimum(zone, 2000)).toBe(false);
    expect(belowMinimum(undefined, 1)).toBe(false);
  });
});

describe("validateForm", () => {
  it("accepts a complete delivery form and any pickup", () => {
    expect(validateForm(complete)).toBeNull();
    expect(validateForm({ ...complete, fulfillment: "pickup", zoneId: null, slotId: null, phone: "" })).toBeNull();
  });

  it.each([
    [{ zoneId: null }, "zone"],
    [{ slotId: null }, "créneau"],
    [{ neighborhood: "  " }, "adresse"],
    [{ phone: "abc" }, "téléphone"],
    [{ phone: "123" }, "téléphone"],
  ] as const)("rejects %j", (override, keyword) => {
    expect(validateForm({ ...complete, ...override })).toContain(keyword);
  });
});

describe("buildOrderPayload", () => {
  const cart = addLine(EMPTY_CART, { productId: 5, name: "Riz", saleUnit: "piece", unitPriceMinor: 5500 }, 2);

  it("sends only ids and quantities, never prices", () => {
    const payload = buildOrderPayload(cart, { ...complete, fulfillment: "pickup" });

    expect(payload).toEqual({ items: [{ product_id: 5, quantity: 2 }], fulfillment: "pickup" });
    expect(JSON.stringify(payload)).not.toContain("5500");
  });

  it("cleans the phone number and address for delivery", () => {
    const payload = buildOrderPayload(cart, { ...complete, landmark: "  Bâtiment B, 3e étage " });

    expect(payload).toMatchObject({
      fulfillment: "delivery",
      delivery: { zone_id: 3, slot_id: 9, phone: "+33612345678", address: { neighborhood: "12 rue de Rivoli, 75004 Paris", landmark: "Bâtiment B, 3e étage" } },
    });
  });

  it("sends a null landmark when left empty", () => {
    expect(buildOrderPayload(cart, complete)).toMatchObject({ delivery: { address: { landmark: null } } });
  });
});

describe("extractApiError", () => {
  it("prefers the first validation error", () => {
    expect(extractApiError({ message: "x", errors: { delivery: ["Ce créneau n'est plus disponible."] } })).toBe("Ce créneau n'est plus disponible.");
  });

  it("falls back to the message, then to the default", () => {
    expect(extractApiError({ message: "Action non autorisée." })).toBe("Action non autorisée.");
    expect(extractApiError(undefined)).toContain("erreur");
    expect(extractApiError("boom", "Oups")).toBe("Oups");
  });
});

describe("safeNext", () => {
  it("keeps internal paths", () => {
    expect(safeNext("/checkout")).toBe("/checkout");
    expect(safeNext("/orders/12?paiement=card")).toBe("/orders/12?paiement=card");
  });

  it.each(["https://evil.test", "//evil.test", "/\\evil.test", "javascript:alert(1)", "commande", "", null, undefined, "/ok\nSet-Cookie: x=1"])(
    "rejects %s",
    (value) => {
      expect(safeNext(value as string | null | undefined)).toBe("/");
    },
  );

  it("uses the given fallback", () => {
    expect(safeNext("//evil.test", "/orders")).toBe("/orders");
  });
});

describe("validateContact", () => {
  const ok = { name: "Awa Koné", email: "awa@example.com", phone: "+33 6 12 34 56 78" };

  it("accepts complete contact details", () => {
    expect(validateContact(ok)).toBeNull();
  });

  it.each([
    [{ name: " " }, "nom"],
    [{ email: "awa" }, "e-mail"],
    [{ email: "awa@exemple" }, "e-mail"],
    [{ phone: "12" }, "téléphone"],
  ])("rejects %j", (change, keyword) => {
    expect(validateContact({ ...ok, ...change })).toContain(keyword);
  });
});