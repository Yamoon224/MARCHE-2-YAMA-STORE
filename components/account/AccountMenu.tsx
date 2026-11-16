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
      <Link href="/connexion" className="rounded-full border border-white/30 bg-white/20 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/30">
        Connexion
      </Link>
    );
  }

  return (
    <span className="hidden items-center gap-3 text-sm text-white md:flex">
      <Link href="/commandes" className="font-bold hover:underline">
        Mes commandes
      </Link>
      <Link href="/notifications" className="font-bold hover:underline" aria-label={badge ? `Notifications, ${unread} non lue(s)` : "Notifications"}>
        Notifications
        {badge && <span className="ml-1 rounded-full bg-[#ffdc37] px-1.5 py-0.5 text-xs font-extrabold text-[#4a2700]">{badge}</span>}
      </Link>
      <button type="button" onClick={logout} className="text-white/80 hover:text-white hover:underline" title={user.name}>
        Déconnexion
      </button>
    </span>
  );
}
