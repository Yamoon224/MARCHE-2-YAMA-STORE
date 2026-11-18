import { OrderLookup } from "@/components/orders/OrderLookup";

export const metadata = { title: "Suivre ma commande - Marché de Yama" };

export default function SuiviPage() {
  return (
    <main className="mx-auto w-[min(1200px,calc(100%-28px))] py-5 sm:py-8">
      <h1 className="text-[26px] font-extrabold sm:text-[32px]">Suivre ma commande</h1>
      <p className="mb-6 mt-2 max-w-xl text-sm text-muted">
        Pas besoin de compte : saisissez le numéro reçu à la validation de votre commande et l&apos;adresse e-mail utilisée.
      </p>
      <OrderLookup />
    </main>
  );
}