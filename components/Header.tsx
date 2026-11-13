import Image from "next/image";
import Link from "next/link";
import { AccountMenu } from "./account/AccountMenu";
import { CartLink } from "./cart/CartLink";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/rayons", label: "Nos rayons" },
  { href: "/commandes", label: "Mes commandes" },
];

export function Header() {
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" aria-label="Marché de Yama, accueil">
          <Image src="/brand/logo.jpg" alt="Marché de Yama" width={96} height={86} priority />
        </Link>
        <form role="search" action="/rayons" className="flex-1">
          <input
            type="search"
            name="q"
            placeholder="Rechercher un produit…"
            aria-label="Rechercher un produit"
            className="w-full rounded-full border border-black/20 px-4 py-2 outline-none focus:border-brand-green"
          />
        </form>
        <AccountMenu />
        <CartLink />
      </div>
      <nav aria-label="Navigation principale" className="bg-brand-green">
        <ul className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 py-2 text-sm text-white">
          {NAV.map((item) => (
            <li key={item.href} className="shrink-0">
              <Link href={item.href} className="hover:underline">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
