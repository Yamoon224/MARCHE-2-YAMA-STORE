"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { browserApi } from "@/lib/api/client";
import { extractApiError } from "@/lib/checkout/checkout";
import { PasswordInput } from "@/components/PasswordInput";

type Session = { id: number; name: string; email?: string | null; is_guest?: boolean } | null;

const field = "mt-1 min-h-11 w-full rounded-lg border border-black/20 bg-white px-3 py-2 outline-none focus:border-brand-green";

/** Proposé aux clients sans compte : choisir un mot de passe suffit pour garder leurs commandes. */
export function GuestAccountPrompt() {
  const [user, setUser] = useState<Session | undefined>(undefined);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((body: { user: Session }) => setUser(body.user))
      .catch(() => setUser(null));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");

    setBusy(true);
    try {
      const { data, error: apiError } = await browserApi().POST("/api/v1/auth/claim-account", { body: { password } });

      if (apiError || !data?.data) return setError(extractApiError(apiError, "Impossible de créer le compte."));
      setDone(data.data.email ?? "");
    } catch {
      setError("Service momentanément indisponible. Réessayez dans un instant.");
    } finally {
      setBusy(false);
    }
  }

  if (done !== null) {
    return (
      <p role="status" className="rounded-[18px] border border-brand-green/30 bg-brand-green/10 p-4 text-sm">
        Votre compte est créé. Connectez-vous avec <strong>{done}</strong> et votre mot de passe pour retrouver toutes vos commandes.
      </p>
    );
  }

  if (!user?.is_guest) return null;

  return (
    <section aria-labelledby="creer-compte" className="rounded-[18px] border border-line bg-white p-4 sm:p-5">
      <h2 id="creer-compte" className="font-display text-lg font-extrabold">Gardez vos commandes : créez votre compte</h2>
      <p className="mt-1 text-sm text-muted">
        Il suffit de choisir un mot de passe. Votre e-mail de commande servira d&apos;identifiant, et cette commande sera rattachée à votre compte.
      </p>
      <form onSubmit={submit} className="mt-3 grid max-w-sm gap-3" noValidate>
        <label className="text-sm font-medium">
          Mot de passe
          <PasswordInput name="password" required minLength={8} autoComplete="new-password" placeholder="8 caractères minimum" className={field} />
        </label>
        {error && (
          <p role="alert" className="rounded-lg bg-brand-red/10 p-3 text-sm text-brand-red">
            {error} {error.includes("connectez-vous") && <Link href="/login" className="underline">Se connecter</Link>}
          </p>
        )}
        <button type="submit" disabled={busy} className="min-h-12 w-full rounded-full bg-brand-red px-6 py-3 font-extrabold text-white hover:bg-brand-red-dark disabled:opacity-60 sm:w-fit">
          {busy ? "Création…" : "Créer mon compte"}
        </button>
      </form>
    </section>
  );
}