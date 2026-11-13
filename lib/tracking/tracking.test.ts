import { describe, expect, it } from "vitest";
import { formatAge, formatCode, mapsUrl, nextPollDelay, shouldShowTracking, TRACKING_LABEL, type DeliveryStatus } from "./tracking";

describe("shouldShowTracking", () => {
  it("shows tracking only for a home delivery that is at least ready", () => {
    for (const status of ["ready", "assigned", "out_for_delivery", "delivery_failed", "delivered", "returned"]) {
      expect(shouldShowTracking(status, "delivery"), status).toBe(true);
    }
    for (const status of ["awaiting_payment", "paid", "confirmed", "preparing", "cancelled"]) {
      expect(shouldShowTracking(status, "delivery"), status).toBe(false);
    }
  });

  it("never shows it for a store pickup", () => {
    expect(shouldShowTracking("ready", "pickup")).toBe(false);
    expect(shouldShowTracking("ready", undefined)).toBe(false);
  });
});

describe("nextPollDelay", () => {
  it("polls fast while the courier is on the road, slowly before, and stops when over", () => {
    expect(nextPollDelay("out_for_delivery")).toBe(15_000);
    for (const status of ["pending", "assigned", "failed"] as const) expect(nextPollDelay(status)).toBe(60_000);
    for (const status of ["delivered", "returned"] as const) expect(nextPollDelay(status)).toBeNull();
  });
});

describe("labels", () => {
  it("has a customer-friendly sentence for every delivery status", () => {
    const statuses: DeliveryStatus[] = ["pending", "assigned", "out_for_delivery", "delivered", "failed", "returned"];
    for (const status of statuses) expect(TRACKING_LABEL[status], status).toBeTruthy();
  });
});

describe("formatCode", () => {
  it("groups a 6-digit code and leaves anything else untouched", () => {
    expect(formatCode("482913")).toBe("482 913");
    expect(formatCode("123")).toBe("123");
    expect(formatCode("abcdef")).toBe("abcdef");
  });
});

describe("mapsUrl", () => {
  it("builds an OpenStreetMap link centred on the position", () => {
    expect(mapsUrl(5.35, -4.01)).toBe("https://www.openstreetmap.org/?mlat=5.35&mlon=-4.01#map=16/5.35/-4.01");
  });
});

describe("formatAge", () => {
  const at = "2026-11-13T10:00:00Z";
  const base = new Date(at).getTime();

  it.each([
    [0, "à l'instant"],
    [9_000, "à l'instant"],
    [40_000, "il y a 40 s"],
    [180_000, "il y a 3 min"],
    [-5_000, "à l'instant"], // horloge du téléphone en avance : jamais négatif
  ])("after %d ms -> %s", (elapsed, expected) => {
    expect(formatAge(at, base + elapsed)).toBe(expected);
  });

  it("returns nothing for an invalid date", () => {
    expect(formatAge("pas une date", base)).toBe("");
  });
});
