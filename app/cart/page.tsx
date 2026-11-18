import { CartView } from "@/components/cart/CartView";

export const metadata = { title: "Mon panier - Marché de Yama" };

export default function PanierPage() {
  return (
    <main className="mx-auto w-[min(1200px,calc(100%-28px))] py-5 sm:py-8">
      <h1 className="mb-6 text-[26px] font-extrabold sm:text-[32px]">Mon panier</h1>
      <CartView />
    </main>
  );
}
