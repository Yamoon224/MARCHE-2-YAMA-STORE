/**
 * Liste blanche des routes de l'API accessibles depuis le navigateur via le relais.
 * Les routes d'authentification (qui renvoient un jeton) et les webhooks n'en font volontairement pas partie.
 */
const ALLOWED_PREFIXES = ["api/v1/products", "api/v1/delivery/zones", "api/v1/orders", "api/v1/auth/me"];

const FORWARDED_REQUEST_HEADERS = ["content-type", "accept", "idempotency-key"];

export function isAllowedPath(segments: string[]): boolean {
  if (segments.some((s) => s === ".." || s === "." || s.includes("\\") || s === "")) return false;

  const path = segments.join("/");

  return ALLOWED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function buildUpstreamHeaders(incoming: Headers, token: string | null): Headers {
  const headers = new Headers();

  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = incoming.get(name);
    if (value) headers.set(name, value);
  }

  headers.set("Accept", headers.get("accept") ?? "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return headers;
}
