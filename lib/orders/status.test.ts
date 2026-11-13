import { describe, expect, it } from "vitest";
import { canCancel, canPay, statusLabel, statusTone, STATUS_LABEL } from "./status";

/** Les 17 statuts du backend (OrderStatus) : chacun doit avoir un libellé français. */
const BACKEND_STATUSES = [
  "draft", "awaiting_payment", "payment_failed", "paid", "under_review", "confirmed", "preparing", "ready",
  "assigned", "out_for_delivery", "delivery_failed", "delivered", "completed", "claim", "refunded", "returned", "cancelled",
];

describe("order status", () => {
  it("labels every backend status in French", () => {
    for (const status of BACKEND_STATUSES) {
      expect(STATUS_LABEL[status], status).toBeTruthy();
    }
    expect(Object.keys(STATUS_LABEL).sort()).toEqual([...BACKEND_STATUSES].sort());
  });

  it("falls back to the raw status for an unknown one", () => {
    expect(statusLabel("teleported")).toBe("teleported");
  });

  it("classifies tones", () => {
    expect(statusTone("cancelled")).toBe("negative");
    expect(statusTone("delivered")).toBe("done");
    expect(statusTone("preparing")).toBe("progress");
  });

  it("allows cancellation only before handover to the courier", () => {
    for (const status of ["awaiting_payment", "paid", "confirmed", "preparing"]) expect(canCancel(status)).toBe(true);
    for (const status of ["ready", "assigned", "out_for_delivery", "delivered", "completed", "cancelled"]) {
      expect(canCancel(status), status).toBe(false);
    }
  });

  it("allows payment only while awaiting it", () => {
    expect(canPay("awaiting_payment")).toBe(true);
    expect(canPay("payment_failed")).toBe(true);
    expect(canPay("paid")).toBe(false);
    expect(canPay("cancelled")).toBe(false);
  });
});
