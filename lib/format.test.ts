import { describe, expect, it } from "vitest";
import { formatXof } from "./format";

describe("formatXof", () => {
  it("formate un montant entier en F CFA avec espaces", () => {
    expect(formatXof(1200)).toBe("1 200 F CFA");
    expect(formatXof(5500)).toBe("5 500 F CFA");
  });

  it("gère zéro et les grands montants", () => {
    expect(formatXof(0)).toBe("0 F CFA");
    expect(formatXof(1250000)).toBe("1 250 000 F CFA");
  });
});
