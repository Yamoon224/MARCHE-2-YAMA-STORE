import { describe, expect, it } from "vitest";
import { pageWindow } from "@/components/catalog/Pagination";
import { toPage } from "./pagination";

describe("toPage", () => {
  it.each([["3", 3], ["1", 1], ["0", 1], ["-2", 1], ["abc", 1], ["2.5", 1], ["99999999", 1], [undefined, 1], [["2", "3"], 1], [" 4 ", 4]])("%j -> %d", (raw, expected) => {
    expect(toPage(raw as string | string[] | undefined)).toBe(expected);
  });
});

describe("pageWindow", () => {
  it("lists every page when there are few", () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
  });

  it("keeps first, last and neighbours with gaps", () => {
    expect(pageWindow(1, 20)).toEqual([1, 2, 3, "…", 20]);
    expect(pageWindow(10, 20)).toEqual([1, "…", 8, 9, 10, 11, 12, "…", 20]);
    expect(pageWindow(20, 20)).toEqual([1, "…", 18, 19, 20]);
  });
});