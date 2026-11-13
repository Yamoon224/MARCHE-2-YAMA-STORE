"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { badgeLabel } from "@/lib/notifications/notifications";

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

  // Le nombre de non lues se relit à chaque page : une erreur réseau n'affiche simplement pas de pastille.
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const loggedIn = Boolean(user);

  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;

    fetch("/api/backend/api/v1/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { meta?: { unread_count?: number } } | null) => !cancelled && setUnread(body?.meta?.unread_count ?? 0))
      .catch(() => !cancelled && setUnread(0));

    return () => {
      cancelled = true;
    };
  }, [loggedIn, pathname]);

  const badge = badgeLabel(unread);

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
      <Link href="/notifications" className="font-medium hover:text-brand-red" aria-label={badge ? `Notifications, ${unread} non lue(s)` : "Notifications"}>
        Notifications
        {badge && <span className="ml-1 rounded-full bg-brand-red px-1.5 py-0.5 text-xs text-white">{badge}</span>}
      </Link>
      <button type="button" onClick={logout} className="text-black/60 hover:text-brand-red" title={user.name}>
        Déconnexion
      </button>
    </span>
  );
}
