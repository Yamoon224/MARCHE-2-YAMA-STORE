import { CartView } from "@/components/cart/CartView";

export const metadata = { title: "Mon panier — Marché de Yama" };

export default function PanierPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Mon panier</h1>
      <CartView />
    </main>
  );
}
