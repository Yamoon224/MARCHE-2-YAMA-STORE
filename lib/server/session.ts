import "server-only";
import { NextResponse } from "next/server";
import { BACKEND_URL, clearToken, getToken, setToken } from "./backend";

type Credentials = Record<string, unknown>;

async function readJson(request: Request): Promise<Credentials | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" ? (body as Credentials) : null;
  } catch {
    return null;
  }
}

/** Appelle l'API d'authentification ; en cas de succès, le jeton va dans le cookie httpOnly et n'est PAS renvoyé au navigateur. */
export async function startSession(request: Request, endpoint: "login" | "register"): Promise<NextResponse> {
  const body = await readJson(request);
  if (!body) return NextResponse.json({ message: "Requête invalide." }, { status: 400 });

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}/api/v1/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Service momentanément indisponible." }, { status: 503 });
  }

  const payload = (await upstream.json().catch(() => null)) as { token?: string; user?: unknown; message?: string; errors?: unknown } | null;

  if (!upstream.ok || !payload?.token) {
    return NextResponse.json(
      { message: payload?.message ?? "Identifiants incorrects.", errors: payload?.errors },
      { status: upstream.ok ? 502 : upstream.status },
    );
  }

  await setToken(payload.token);

  return NextResponse.json({ user: payload.user }, { status: upstream.status });
}

export async function currentUser(): Promise<NextResponse> {
  const token = await getToken();
  if (!token) return NextResponse.json({ user: null });

  const upstream = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  }).catch(() => null);

  if (!upstream) return NextResponse.json({ user: null }, { status: 503 });

  if (upstream.status === 401) {
    await clearToken(); // jeton révoqué ou expiré
    return NextResponse.json({ user: null });
  }

  const payload = (await upstream.json().catch(() => null)) as { data?: unknown } | null;

  return NextResponse.json({ user: payload?.data ?? null });
}

export async function endSession(): Promise<NextResponse> {
  const token = await getToken();

  if (token) {
    await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    }).catch(() => null); // on efface le cookie même si le serveur est injoignable
  }

  await clearToken();

  return new NextResponse(null, { status: 204 });
}
