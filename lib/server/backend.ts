import "server-only";
import { cookies } from "next/headers";
import { createApiClient } from "@/lib/api/client";

/** Adresse de l'API Laravel, lue côté serveur uniquement. */
export const BACKEND_URL = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://marche-2-yama.test";

export const TOKEN_COOKIE = "yama_token";

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

export async function getToken(): Promise<string | null> {
  return (await cookies()).get(TOKEN_COOKIE)?.value ?? null;
}

/** Le jeton Sanctum vit dans un cookie httpOnly : le JavaScript du navigateur n'y a jamais accès. */
export async function setToken(token: string): Promise<void> {
  (await cookies()).set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS_IN_SECONDS,
  });
}

export async function clearToken(): Promise<void> {
  (await cookies()).delete(TOKEN_COOKIE);
}

/** Client typé côté serveur, authentifié par le cookie de session s'il existe. */
export async function serverApi() {
  const token = await getToken();
  return createApiClient({
    baseUrl: BACKEND_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
