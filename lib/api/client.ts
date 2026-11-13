import createClient from "openapi-fetch";
import type { paths } from "./schema";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://marche-2-yama.test";

type ClientOptions = { baseUrl?: string; fetch?: typeof fetch; headers?: Record<string, string> };

/** Client typé généré depuis l'OpenAPI du backend (`npm run api:generate`). */
export function createApiClient({ baseUrl = API_BASE_URL, fetch, headers }: ClientOptions = {}) {
  return createClient<paths>({ baseUrl, fetch, headers });
}

export type ApiClient = ReturnType<typeof createApiClient>;

export const api: ApiClient = createApiClient();

/**
 * Client utilisé dans le navigateur : il passe par le relais `/api/backend` de la vitrine,
 * qui ajoute le jeton du cookie httpOnly. Le navigateur ne manipule jamais le jeton.
 */
export const BROWSER_API_BASE = "/api/backend";

export function browserApi(fetchImpl?: typeof fetch): ApiClient {
  return createApiClient({ baseUrl: BROWSER_API_BASE, fetch: fetchImpl });
}
