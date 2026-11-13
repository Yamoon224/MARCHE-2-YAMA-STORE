import { describe, expect, it } from "vitest";
import {
  buildClaimFormData, issueNeedsPhoto, MAX_PHOTO_BYTES, parseQuantity, validateDraft, validatePhotos, type DraftLine,
} from "./claims";

const line = (over: Partial<DraftLine> = {}): DraftLine => ({
  orderLineId: 7, name: "Lait", saleUnit: "piece", received: 3, selected: true, issue: "damaged", quantity: "1", note: "", ...over,
});
const jpeg = { name: "preuve.jpg", type: "image/jpeg", size: 100_000 };

describe("issueNeedsPhoto", () => {
  it("exempts only a missing article", () => {
    expect(issueNeedsPhoto("missing")).toBe(false);
    for (const issue of ["damaged", "expired", "non_conforming"] as const) expect(issueNeedsPhoto(issue)).toBe(true);
  });
});

describe("parseQuantity", () => {
  it.each([["1", 1], [" 250 ", 250], ["1200", 1200]])("accepts %j", (input, expected) => expect(parseQuantity(input)).toBe(expected));
  it.each(["", "0", "-1", "1,5", "1.5", "abc", "12 g", "99999999"])("rejects %j", (input) => expect(parseQuantity(input)).toBeNull());
});

describe("validatePhotos", () => {
  it("accepts up to five real image types", () => {
    expect(validatePhotos([])).toBeNull();
    expect(validatePhotos(Array(5).fill(jpeg))).toBeNull();
    expect(validatePhotos([{ ...jpeg, type: "image/png" }, { ...jpeg, type: "image/webp" }])).toBeNull();
  });

  it("refuses too many, wrong types and oversized files", () => {
    expect(validatePhotos(Array(6).fill(jpeg))).toContain("5 photos");
    expect(validatePhotos([{ ...jpeg, name: "doc.pdf", type: "application/pdf" }])).toContain("doc.pdf");
    expect(validatePhotos([{ ...jpeg, type: "image/svg+xml" }])).toContain("JPEG, PNG ou WebP");
    expect(validatePhotos([{ ...jpeg, size: MAX_PHOTO_BYTES + 1 }])).toContain("4 Mo");
    expect(validatePhotos([{ ...jpeg, size: MAX_PHOTO_BYTES }])).toBeNull();
  });
});

describe("validateDraft", () => {
  it("accepts a complete draft", () => {
    expect(validateDraft([line()], [jpeg])).toBeNull();
    expect(validateDraft([line({ issue: "missing" })], [])).toBeNull();
  });

  it("requires at least one selected article", () => {
    expect(validateDraft([line({ selected: false })], [jpeg])).toContain("au moins un article");
    expect(validateDraft([], [])).toContain("au moins un article");
  });

  it("checks the quantity against what was received", () => {
    expect(validateDraft([line({ quantity: "abc" })], [jpeg])).toContain("quantité entière");
    expect(validateDraft([line({ quantity: "0" })], [jpeg])).toContain("quantité entière");
    expect(validateDraft([line({ quantity: "4" })], [jpeg])).toContain("3 pièce(s)");
    expect(validateDraft([line({ saleUnit: "kg", received: 1200, quantity: "1300" })], [jpeg])).toContain("1200 g");
  });

  it("ignores the quantity of articles that are not selected", () => {
    expect(validateDraft([line(), line({ orderLineId: 8, selected: false, quantity: "nonsense" })], [jpeg])).toBeNull();
  });

  it("requires a photo as soon as one selected article needs it", () => {
    expect(validateDraft([line({ issue: "expired" })], [])).toContain("photo");
    expect(validateDraft([line({ issue: "missing" }), line({ orderLineId: 8, issue: "damaged" })], [])).toContain("photo");
  });

  it("reports an invalid photo", () => {
    expect(validateDraft([line()], [{ ...jpeg, type: "application/pdf" }])).toContain("JPEG, PNG ou WebP");
  });
});

describe("buildClaimFormData", () => {
  it("sends only selected articles, in the format the API expects", () => {
    const file = new File(["x"], "preuve.jpg", { type: "image/jpeg" });
    const form = buildClaimFormData(
      [line({ orderLineId: 7, quantity: " 2 ", note: " percé " }), line({ orderLineId: 9, selected: false }), line({ orderLineId: 11, issue: "missing", quantity: "1" })],
      [file],
      " Carton écrasé ",
    );

    expect(form.get("items[0][order_line_id]")).toBe("7");
    expect(form.get("items[0][issue]")).toBe("damaged");
    expect(form.get("items[0][quantity]")).toBe("2");
    expect(form.get("items[0][note]")).toBe("percé");
    expect(form.get("items[1][order_line_id]")).toBe("11");
    expect(form.has("items[2][order_line_id]")).toBe(false); // la ligne non sélectionnée n'est pas envoyée
    expect(form.getAll("photos[]")).toHaveLength(1);
    expect(form.get("description")).toBe("Carton écrasé");
  });

  it("omits empty notes and description", () => {
    const form = buildClaimFormData([line()], [], "   ");

    expect(form.has("items[0][note]")).toBe(false);
    expect(form.has("description")).toBe(false);
  });
});
