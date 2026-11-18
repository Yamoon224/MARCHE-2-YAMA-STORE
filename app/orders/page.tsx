import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { formatMoney } from "@/lib/format";
import { serverApi } from "@/lib/server/backend";

export const metadata = { title: "Mes commandes - Marché de Yama" };

export default function CommandesPage() {
  return (
    <main className="mx-auto w-[min(768px,calc(100%-28px))] py-5 sm:py-8">
      <h1 className="mb-5 text-[26px] font-extrabold sm:mb-6 sm:text-[32px]">Mes commandes</h1>
      <Suspense fallback={<p className="text-black/60">Chargement de vos commandes…</p>}>
        <OrderList />
      </Suspense>
    </main>
  );
}

type OrderRow = { id: number; number?: string | null; status: string; total_minor: number };

async function OrderList() {
  const api = await serverApi();
  const result = await api.GET("/api/v1/orders").catch(() => null);

  if (result?.response.status === 401) redirect("/login?next=/orders");

  if (!result) {
    return <p role="status" className="rounded-lg bg-black/5 p-3 text-sm">Service momentanément indisponible. Réessayez dans un instant.</p>;
  }

  const orders = ((result.data as { data?: OrderRow[] } | undefined)?.data ?? []) as OrderRow[];

  if (orders.length === 0) {
    return (
      <p className="text-black/70">
        Aucune commande pour le moment. <Link href="/aisles" className="text-brand-red underline">Faire mes courses</Link>
      </p>
    );
  }

  return (
    <ul className="divide-y divide-black/10 rounded-xl border border-black/10">
      {orders.map((order) => (
        <li key={order.id}>
          <Link href={`/orders/${order.id}`} className="flex min-h-14 flex-wrap items-center justify-between gap-x-3 gap-y-1 p-4 hover:bg-black/5">
            <span className="min-w-0 font-medium [overflow-wrap:anywhere]">{order.number ?? `Commande ${order.id}`}</span>
            <StatusBadge status={order.status} />
            <span className="font-semibold">{formatMoney(order.total_minor)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
