import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata = { title: "Valider ma commande — Marché de Yama" };

export default function CommandePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Valider ma commande</h1>
      <CheckoutView />
    </main>
  );
}
