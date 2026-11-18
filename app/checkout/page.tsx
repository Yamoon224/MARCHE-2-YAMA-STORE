import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata = { title: "Valider ma commande - Marché de Yama" };

export default function CommandePage() {
  return (
    <main className="mx-auto w-[min(1200px,calc(100%-28px))] py-5 sm:py-8">
      <h1 className="mb-5 text-[26px] font-extrabold sm:mb-6 sm:text-[32px]">Valider ma commande</h1>
      <CheckoutView />
    </main>
  );
}
