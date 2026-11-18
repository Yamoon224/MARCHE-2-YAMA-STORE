"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartProvider";
import { CartIcon } from "./CartIcon";

export function CartLink() {
  const { itemCount, ready } = useCart();

  return (
    <Link
      href="/cart"
      aria-label="Panier"
      className="relative flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 text-sm font-bold text-white hover:bg-white/30 md:px-4"
    >
      <CartIcon className="h-5 w-5 md:h-[18px] md:w-[18px]" /> <span className="hidden md:inline">Panier</span>
      {ready && itemCount > 0 && (
        <span
          aria-label={`${itemCount} article${itemCount > 1 ? "s" : ""} dans le panier`}
          className="absolute -right-1.5 -top-2 grid h-5 min-w-5 place-items-center rounded-full border-2 border-brand-red bg-[#ffdc37] px-1 text-[11px] font-extrabold text-[#4a2700]"
        >
          {itemCount}
        </span>
      )}
    </Link>
  );
}
