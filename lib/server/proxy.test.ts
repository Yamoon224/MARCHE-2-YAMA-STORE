import { describe, expect, it } from "vitest";
import { buildUpstreamHeaders, isAllowedPath } from "./proxy";

describe("isAllowedPath", () => {
  it.each([
    ["api/v1/products"],
    ["api/v1/products/tomates"],
    ["api/v1/delivery/zones"],
    ["api/v1/delivery/zones/3/slots"],
    ["api/v1/orders"],
    ["api/v1/orders/12"],
    ["api/v1/orders/12/payments"],
    ["api/v1/orders/12/invoice"],
    ["api/v1/auth/me"],
  ])("allows %s", (path) => {
    expect(isAllowedPath(path.split("/"))).toBe(true);
  });

  it.each([
    ["api/v1/auth/login"],
    ["api/v1/auth/register"],
    ["api/v1/auth/logout"],
    ["api/v1/webhooks/payments/fake"],
    ["api/v1/accounting/trial-balance"],
    ["api/v1/payments/1/validate-cash-on-delivery"],
    ["api/v1/delivery/slots"],
    ["api/v1/productsx"],
    ["up"],
    [""],
  ])("blocks %s", (path) => {
    expect(isAllowedPath(path.split("/"))).toBe(false);
  });

  it("blocks path traversal attempts", () => {
    expect(isAllowedPath(["api", "v1", "orders", "..", "auth", "login"])).toBe(false);
    expect(isAllowedPath(["api", "v1", "orders", ".", "1"])).toBe(false);
    expect(isAllowedPath(["api", "v1", "orders\\..\\auth"])).toBe(false);
    expect(isAllowedPath(["api", "v1", "orders", "", "1"])).toBe(false);
  });
});

describe("buildUpstreamHeaders", () => {
  it("forwards only safe headers and adds the session token", () => {
    const incoming = new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
      "Idempotency-Key": "abc",
      Cookie: "yama_token=secret",
      "X-Forwarded-For": "1.2.3.4",
    });

    const headers = buildUpstreamHeaders(incoming, "tok123");

    expect(headers.get("authorization")).toBe("Bearer tok123");
    expect(headers.get("idempotency-key")).toBe("abc");
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.has("cookie")).toBe(false);
    expect(headers.has("x-forwarded-for")).toBe(false);
  });

  it("never lets the browser choose the Authorization header", () => {
    const incoming = new Headers({ Authorization: "Bearer stolen-admin-token" });

    expect(buildUpstreamHeaders(incoming, null).has("authorization")).toBe(false);
    expect(buildUpstreamHeaders(incoming, "mine").get("authorization")).toBe("Bearer mine");
  });

  it("asks for JSON by default", () => {
    expect(buildUpstreamHeaders(new Headers(), null).get("accept")).toBe("application/json");
  });
});
