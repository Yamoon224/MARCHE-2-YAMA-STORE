import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AccountMenu } from "./account/AccountMenu";
import { CartLink } from "./cart/CartLink";
import { MainNav } from "./MainNav";
import { SearchForm } from "./SearchForm";

export function Header() {
  return (
    <>
      <div className="bg-[#8f0013] text-xs text-white">
        <div className="mx-auto flex h-[34px] max-w-[1200px] items-center justify-between gap-3 px-4">
          <strong>Marché de Yama - les saveurs de l&apos;Afrique à portée de main.</strong>
          <span className="hidden gap-5 sm:flex">
            <span>🚚 Livraison à Paris &amp; en Île-de-France</span>
            <span>✦ Produits sélectionnés</span>
          </span>
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
          <Suspense fallback={<div className="order-last col-span-3 h-11 rounded-full bg-white md:order-none md:col-span-1" aria-hidden="true" />}>
            <SearchForm />
          </Suspense>
          <div className="flex items-center gap-2 justify-self-end">
            <Suspense fallback={<span className="w-24" aria-hidden="true" />}>
              <AccountMenu />
            </Suspense>
            <CartLink />
          </div>
        </div>
        <Suspense fallback={<div className="h-[43px] border-t border-white/20 bg-[#b90018]" aria-hidden="true" />}>
          <MainNav />
        </Suspense>
      </header>
    </>
  );
}
