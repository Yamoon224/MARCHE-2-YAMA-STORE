"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { extractApiError, safeNext } from "@/lib/checkout/checkout";

type Mode = "login" | "register";

export function AuthForm({ next }: { next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const data = new FormData(event.currentTarget);
    const login = String(data.get("login") ?? "").trim();
    const body =
      mode === "login"
        ? { login, password: data.get("password") }
        : {
            name: data.get("name"),
            password: data.get("password"),
            ...(login.includes("@") ? { email: login } : { phone: login.replace(/[\s.-]/g, "") }),
          };

    try {
      const response = await fetch(mode === "login" ? "/api/session" : "/api/session/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        setError(extractApiError(await response.json().catch(() => null), "Connexion impossible."));
        return;
      }

      router.push(safeNext(next));
      router.refresh();
    } catch {
      setError("Service momentanément indisponible. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  const field = "mt-1 w-full rounded-lg border border-black/20 px-3 py-2 outline-none focus:border-brand-green";

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-sm flex-col gap-4" noValidate>
      <h1 className="text-2xl font-bold">{mode === "login" ? "Connexion" : "Créer un compte"}</h1>

      {mode === "register" && (
        <label className="text-sm font-medium">
          Nom complet
          <input name="name" required autoComplete="name" placeholder="Ex. Awa Koné" className={field} />
        </label>
      )}

      <label className="text-sm font-medium">
        {mode === "login" ? "E-mail ou téléphone" : "E-mail ou téléphone (+225…)"}
        <input name="login" required autoComplete="username" placeholder={mode === "login" ? "E-mail ou téléphone" : "Ex. awa@exemple.com ou +225 07 00 00 00 00"} className={field} />
      </label>

      <label className="text-sm font-medium">
        Mot de passe
        <PasswordInput
          name="password"
          placeholder={mode === "login" ? "Votre mot de passe" : "8 caractères minimum"}
          required
          minLength={mode === "register" ? 8 : undefined}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className={field}
        />
      </label>

      {error && (
        <p role="alert" className="rounded-lg bg-brand-red/10 p-3 text-sm text-brand-red">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="rounded-full bg-brand-red py-2.5 font-medium text-white disabled:opacity-60">
        {busy ? "Patientez…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError(null);
        }}
        className="text-sm text-brand-green hover:underline"
      >
        {mode === "login" ? "Pas encore de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
      </button>
    </form>
  );
}
