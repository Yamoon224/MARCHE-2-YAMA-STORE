import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { formatMoney } from "@/lib/format";
import { serverApi } from "@/lib/server/backend";

export const metadata = { title: "Mes commandes — Marché de Yama" };

export default function CommandesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Mes commandes</h1>
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

  if (result?.response.status === 401) redirect("/connexion?next=/commandes");

  if (!result) {
    return <p role="status" className="rounded-lg bg-black/5 p-3 text-sm">Service momentanément indisponible. Réessayez dans un instant.</p>;
  }

  const orders = ((result.data as { data?: OrderRow[] } | undefined)?.data ?? []) as OrderRow[];

  if (orders.length === 0) {
    return (
      <p className="text-black/70">
        Aucune commande pour le moment. <Link href="/rayons" className="text-brand-red underline">Faire mes courses</Link>
      </p>
    );
  }

  return (
    <ul className="divide-y divide-black/10 rounded-xl border border-black/10">
      {orders.map((order) => (
        <li key={order.id}>
          <Link href={`/commandes/${order.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-black/5">
            <span className="font-medium">{order.number ?? `Commande ${order.id}`}</span>
            <StatusBadge status={order.status} />
            <span className="font-semibold">{formatMoney(order.total_minor)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
