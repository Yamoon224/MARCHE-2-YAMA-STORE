import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AccountMenu } from "./account/AccountMenu";
import { CartLink } from "./cart/CartLink";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/rayons", label: "Nos rayons" },
  { href: "/commandes", label: "Mes commandes" },
];

export function Header() {
  return (
    <>
      <div className="bg-[#8f0013] text-xs text-white">
        <div className="mx-auto flex h-[34px] max-w-[1200px] items-center justify-between gap-3 px-4">
          <b>Les meilleurs produits, aux meilleurs prix</b>
          <span className="hidden sm:inline">🚚 Livraison à domicile ou retrait en magasin</span>
        </div>
      </div>
      <header className="sticky top-0 z-30 bg-gradient-to-br from-[#bd0019] to-[#e3132c] text-white shadow-[0_5px_22px_#7f001a30]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 px-4 py-2 md:min-h-[84px] md:grid-cols-[auto_minmax(220px,440px)_auto] md:justify-between md:gap-5">
          <Link href="/" aria-label="Marché de Yama, accueil">
            <Image
              src="/brand/logo-marche-yama.png"
              alt="Marché de Yama"
              width={104}
              height={76}
              priority
              className="h-[58px] w-[80px] object-contain md:h-[76px] md:w-[104px]"
            />
          </Link>
          <form
            role="search"
            action="/rayons"
            className="order-last col-span-3 flex h-11 rounded-full bg-white py-1 pl-4 pr-1 md:order-none md:col-span-1"
          >
            <input
              type="search"
              name="q"
              placeholder="Rechercher un produit…"
              aria-label="Rechercher un produit"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
            />
            <button type="submit" aria-label="Lancer la recherche" className="w-9 rounded-full bg-brand-green text-lg text-white">
              ⌕
            </button>
          </form>
          <div className="flex items-center gap-2 justify-self-end">
            <Suspense fallback={<span className="w-24" aria-hidden="true" />}>
              <AccountMenu />
            </Suspense>
            <CartLink />
          </div>
        </div>
        <nav aria-label="Navigation principale" className="border-t border-white/20 bg-[#b90018]">
          <ul className="mx-auto flex max-w-[1200px] gap-9 overflow-x-auto px-4 md:justify-center">
            {NAV.map((item) => (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  className="block border-b-2 border-transparent py-2.5 text-[13px] font-bold text-[#ffe3e6] hover:border-brand-gold hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
}
