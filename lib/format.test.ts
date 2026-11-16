import { describe, expect, it } from "vitest";
import { formatMoney } from "./format";

describe("formatMoney", () => {
  it("formate un montant entier en euros avec espaces", () => {
    expect(formatMoney(1200)).toBe("12,00 €");
    expect(formatMoney(5500)).toBe("55,00 €");
  });

  it("gère zéro et les grands montants", () => {
    expect(formatMoney(0)).toBe("0,00 €");
    expect(formatMoney(1250000)).toBe("12 500,00 €");
  });
});
