"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { badgeLabel } from "@/lib/notifications/notifications";
import { NAV } from "./nav-items";

type User = { name: string } | null;

/**
 * Menu des petits écrans : un bouton burger ouvre un tiroir avec la navigation et le compte.
 * Le tiroir se ferme au changement de page, avec Échap ou en touchant le fond ; le défilement de la page est bloqué tant qu'il est ouvert.
 */
export function MobileMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [unread, setUnread] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  // Ferme le tiroir quand la page change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  // À l'ouverture : lit la session (cookie httpOnly, invisible d'ici), bloque le défilement et gère Échap.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    fetch("/api/session", { cache: "no-store" })
      .then((r) => r.json())
      .then(async (body: { user: User }) => {
        if (cancelled) return;
        setUser(body.user);
        if (!body.user) return;

        const response = await fetch("/api/backend/api/v1/notifications", { cache: "no-store" });
        const notifications = response.ok ? ((await response.json()) as { meta?: { unread_count?: number } }) : null;
        if (!cancelled) setUnread(notifications?.meta?.unread_count ?? 0);
      })
      .catch(() => !cancelled && setUser(null));

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();

    const opener = openerRef.current;
    return () => {
      cancelled = true;
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open]);

  async function logout() {
    await fetch("/api/session", { method: "DELETE" });
    setUser(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const badge = badgeLabel(unread);
  const item = "flex min-h-12 items-center justify-between rounded-xl px-3 text-[15px] font-bold text-foreground hover:bg-black/5";

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/20 text-white hover:bg-white/30 md:hidden"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="Fermer le menu" tabIndex={-1} onClick={() => setOpen(false)} className="absolute inset-0 bg-black/50" />
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 left-0 flex w-[min(88vw,22rem)] flex-col overflow-y-auto bg-white text-foreground shadow-2xl"
          >
            <div className="flex items-center justify-between bg-gradient-to-br from-[#bd0019] to-[#e3132c] px-4 py-3 text-white">
              <b className="font-display text-lg font-extrabold">Marché de Yama</b>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="grid h-11 w-11 place-items-center rounded-full bg-white/20 hover:bg-white/30"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav aria-label="Navigation principale" className="p-3">
              <ul>
                {NAV.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} onClick={() => setOpen(false)} className={item}>
                      {n.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/aisles" onClick={() => setOpen(false)} className={item}>
                    Tous les produits
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label="Mon compte" className="mt-auto border-t border-line p-3">
              {user === undefined ? (
                <p className="px-3 py-2 text-sm text-muted">Chargement…</p>
              ) : user === null ? (
                <Link href="/login" onClick={() => setOpen(false)} className="grid min-h-12 place-items-center rounded-full bg-brand-red text-[15px] font-extrabold text-white">
                  Connexion / Créer un compte
                </Link>
              ) : (
                <ul>
                  <li className="px-3 pb-1 text-xs text-muted">Connecté : {user.name}</li>
                  <li>
                    <Link href="/orders" onClick={() => setOpen(false)} className={item}>
                      Mes commandes
                    </Link>
                  </li>
                  <li>
                    <Link href="/notifications" onClick={() => setOpen(false)} className={item}>
                      Notifications
                      {badge && <span className="rounded-full bg-[#ffdc37] px-2 py-0.5 text-xs font-extrabold text-[#4a2700]">{badge}</span>}
                    </Link>
                  </li>
                  <li>
                    <button type="button" onClick={logout} className={`${item} w-full text-brand-red`}>
                      Déconnexion
                    </button>
                  </li>
                </ul>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
