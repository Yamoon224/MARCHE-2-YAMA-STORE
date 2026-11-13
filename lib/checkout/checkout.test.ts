import { describe, expect, it } from "vitest";
import { addLine, EMPTY_CART } from "@/lib/cart/cart";
import {
  belowMinimum, buildOrderPayload, estimateDeliveryFee, extractApiError, safeNext, validateForm,
  type CheckoutForm, type Zone,
} from "./checkout";

const zone: Zone = { id: 3, name: "Cocody", fee_minor: 1500, free_above_minor: 20000, min_order_minor: 2000 };
const complete: CheckoutForm = {
  fulfillment: "delivery", zoneId: 3, slotId: 9, neighborhood: " Cocody ", landmark: "", phone: "+225 07 00 11 22 33",
};

describe("delivery fee estimate", () => {
  it("charges the zone fee below the free threshold and nothing above or at it", () => {
    expect(estimateDeliveryFee(zone, 19999)).toBe(1500);
    expect(estimateDeliveryFee(zone, 20000)).toBe(0);
    expect(estimateDeliveryFee(zone, 50000)).toBe(0);
  });

  it("charges the fee when the zone has no free threshold, and nothing without a zone", () => {
    expect(estimateDeliveryFee({ ...zone, free_above_minor: null }, 999999)).toBe(1500);
    expect(estimateDeliveryFee(undefined, 5000)).toBe(0);
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
    [{ neighborhood: "  " }, "quartier"],
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
    const payload = buildOrderPayload(cart, { ...complete, landmark: "  Derrière la pharmacie " });

    expect(payload).toMatchObject({
      fulfillment: "delivery",
      delivery: { zone_id: 3, slot_id: 9, phone: "+2250700112233", address: { neighborhood: "Cocody", landmark: "Derrière la pharmacie" } },
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
    expect(safeNext("/commande")).toBe("/commande");
    expect(safeNext("/commandes/12?paiement=card")).toBe("/commandes/12?paiement=card");
  });

  it.each(["https://evil.test", "//evil.test", "/\\evil.test", "javascript:alert(1)", "commande", "", null, undefined, "/ok\nSet-Cookie: x=1"])(
    "rejects %s",
    (value) => {
      expect(safeNext(value as string | null | undefined)).toBe("/");
    },
  );

  it("uses the given fallback", () => {
    expect(safeNext("//evil.test", "/commandes")).toBe("/commandes");
  });
});
