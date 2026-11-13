"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = { name: string } | null;

/** L'état de connexion est lu auprès du serveur : le jeton reste dans un cookie httpOnly, invisible d'ici. */
export function AccountMenu() {
  const router = useRouter();
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((body: { user: User }) => !cancelled && setUser(body.user))
      .catch(() => !cancelled && setUser(null));

    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    await fetch("/api/session", { method: "DELETE" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (user === undefined) return <span className="w-24" aria-hidden="true" />;

  if (user === null) {
    return (
      <Link href="/connexion" className="text-sm font-medium hover:text-brand-red">
        Connexion
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-3 text-sm">
      <Link href="/commandes" className="font-medium hover:text-brand-red">
        Mes commandes
      </Link>
      <button type="button" onClick={logout} className="text-black/60 hover:text-brand-red" title={user.name}>
        Déconnexion
      </button>
    </span>
  );
}
