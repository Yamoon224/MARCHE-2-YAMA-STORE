"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartProvider";
import { CartIcon } from "./CartIcon";

export function CartLink() {
  const { itemCount, ready } = useCart();

  return (
    <Link
      href="/panier"
      className="relative flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/30"
    >
      <CartIcon className="h-[18px] w-[18px]" /> Panier
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
