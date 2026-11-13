"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartProvider";

export function CartLink() {
  const { itemCount, ready } = useCart();

  return (
    <Link href="/panier" className="relative rounded-full bg-brand-red px-4 py-2 text-sm font-medium text-white">
      Panier
      {ready && itemCount > 0 && (
        <span
          aria-label={`${itemCount} article${itemCount > 1 ? "s" : ""} dans le panier`}
          className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-brand-red"
        >
          {itemCount}
        </span>
      )}
    </Link>
  );
}
