"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/#categories", label: "Catégories", section: "categories" },
  { href: "/#combos", label: "Combos africains", section: "combos" },
  { href: "/#populaires", label: "Nos produits", section: "populaires" },
  { href: "/#livraison", label: "Livraison", section: "livraison" },
  { href: "/tracking", label: "Suivre ma commande" },
];

/** Sections de l'accueil, dans l'ordre de la page, rattachées à l'entrée de menu qu'elles font vivre. */
const SECTION_TO_ITEM: Array<[test: (id: string) => boolean, item: string]> = [
  [(id) => id === "categories", "categories"],
  [(id) => id === "combos", "combos"],
  [(id) => id === "populaires" || id === "promos" || id === "catalogue" || id.startsWith("rayon-"), "populaires"],
  [(id) => id === "livraison", "livraison"],
];

// Les sections se chargent en flux : on les retrouve à chaque défilement plutôt qu'une seule fois.
const SECTION_SELECTOR = "main section[id]";
const ACTIVATION_LINE = 160; // juste sous l'en-tête collant

/** Menu principal : l'ancre de la section visible à l'écran est soulignée. */
export function MainNav() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== "/") return;
    let frame = 0;

    const update = () => {
      frame = 0;
      let current: string | null = null;
      for (const el of document.querySelectorAll<HTMLElement>(SECTION_SELECTOR)) {
        if (el.getBoundingClientRect().top <= ACTIVATION_LINE) {
          current = SECTION_TO_ITEM.find(([test]) => test(el.id))?.[1] ?? current;
        }
      }
      setActiveSection(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Une section qui arrive en flux déplace les autres : on recalcule.
    const observer = new MutationObserver(onScroll);
    observer.observe(document.querySelector("main") ?? document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  const isActive = (item: (typeof NAV)[number]) => {
    if (item.section) return pathname === "/" && activeSection === item.section;
    if (item.href === "/") return pathname === "/" && activeSection === null;
    return pathname.startsWith(item.href);
  };

  return (
    <nav aria-label="Navigation principale" className="border-t border-white/20 bg-[#b90018]">
      <ul className="mx-auto flex max-w-[1200px] gap-9 overflow-x-auto px-4 md:justify-center">
        {NAV.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "location" : undefined}
                className={`block border-b-[3px] py-2.5 text-[13px] font-bold transition-colors hover:border-brand-gold hover:text-white ${active ? "border-white text-white" : "border-transparent text-[#ffe3e6]"}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
