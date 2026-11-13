import { describe, expect, it } from "vitest";
import { badgeLabel, formatWhen } from "./notifications";

describe("badgeLabel", () => {
  it.each([[0, null], [-3, null], [Number.NaN, null], [1, "1"], [9, "9"], [10, "9+"], [250, "9+"]])("%s -> %s", (count, expected) => {
    expect(badgeLabel(count)).toBe(expected);
  });
});

describe("formatWhen", () => {
  it("words a date in French, in UTC", () => {
    expect(formatWhen("2026-11-14T09:30:00Z")).toBe("14 nov. à 09:30");
  });

  it("returns an empty text for an unreadable date", () => {
    expect(formatWhen("pas une date")).toBe("");
  });
});
