import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { CancelOrderButton } from "@/components/orders/CancelOrderButton";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { TrackingPanel } from "@/components/orders/TrackingPanel";
import { formatQuantity } from "@/lib/cart/cart";
import { CLAIM_STATUS_LABEL, ISSUE_LABEL, RESOLUTION_LABEL, type Issue } from "@/lib/claims/claims";
import { formatXof } from "@/lib/format";
import { canCancel, canPay, statusLabel } from "@/lib/orders/status";
import { shouldShowTracking } from "@/lib/tracking/tracking";
import { serverApi } from "@/lib/server/backend";

export const metadata = { title: "Suivi de commande — Marché de Yama" };

const dateTime = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" });

const PAYMENT_NOTICE: Record<string, string> = {
  mobile_money: "Validez le paiement sur votre téléphone : votre commande passera en « Payée » dès la confirmation de l'opérateur.",
  card: "Votre paiement par carte est en cours de confirmation.",
  cash_on_delivery: "Un conseiller vous contactera pour valider votre commande. Vous réglerez à la livraison.",
  erreur: "Votre commande est enregistrée, mais le paiement n'a pas pu démarrer. Vous pouvez réessayer depuis cette page.",
};

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ paiement?: string | string[]; reclamation?: string | string[] }> };

export default function CommandePage(props: Props) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Suspense fallback={<p className="text-black/60">Chargement de la commande…</p>}>
        <OrderDetail {...props} />
      </Suspense>
    </main>
  );
}

async function OrderDetail({ params, searchParams }: Props) {
  const { id } = await params;
  const { paiement, reclamation } = await searchParams;
  const reclamationOk = reclamation === "ok";
  if (!/^\d+$/.test(id)) notFound();

  const api = await serverApi();
  const [result, claimsResult] = await Promise.all([
    api.GET("/api/v1/orders/{order}", { params: { path: { order: Number(id) } } }).catch(() => null),
    api.GET("/api/v1/claims").catch(() => null),
  ]);

  if (result?.response.status === 401) redirect(`/connexion?next=/commandes/${id}`);
  if (result?.response.status === 403 || result?.response.status === 404) notFound();

  const order = result?.data?.data;
  if (!order) {
    return <p role="status" className="rounded-lg bg-black/5 p-3">Service momentanément indisponible. Réessayez dans un instant.</p>;
  }

  const claim = claimsResult?.data?.data.find((c) => c.order_id === order.id);
  const notice = typeof paiement === "string" ? PAYMENT_NOTICE[paiement] : undefined;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">{order.number ?? `Commande ${order.id}`}</h1>
        <StatusBadge status={order.status} />
      </div>

      {paiement === undefined && reclamationOk && <p role="status" className="mt-4 rounded-lg bg-brand-green/10 p-3 text-sm">Votre réclamation a bien été enregistrée : nous l&apos;examinons et revenons vers vous.</p>}

      {notice && order.status === "awaiting_payment" && (
        <p role="status" className="mt-4 rounded-lg bg-brand-green/10 p-3 text-sm">{notice}</p>
      )}

      {shouldShowTracking(order.status, order.fulfillment) && <TrackingPanel orderId={order.id} />}

      {claim && (
        <section aria-labelledby="reclamation" className="mt-6 rounded-xl border border-black/10 p-4">
          <h2 id="reclamation" className="text-lg font-semibold">Votre réclamation</h2>
          <p className="mt-1 text-sm">
            Statut : <strong>{CLAIM_STATUS_LABEL[claim.status] ?? claim.status}</strong>
            {claim.resolution ? ` — ${RESOLUTION_LABEL[claim.resolution] ?? claim.resolution}` : ""}
          </p>
          <ul className="mt-2 text-sm text-black/70">
            {claim.items.map((item) => <li key={item.id}>{item.name} : {ISSUE_LABEL[item.issue as Issue] ?? item.issue}</li>)}
          </ul>
          {claim.status === "accepted" && claim.refund_amount_minor > 0 && (
            <p className="mt-2 text-sm">
              Remboursement de <strong>{formatXof(claim.refund_amount_minor)}</strong>{claim.refund_completed ? " effectué." : " en cours de traitement."}
            </p>
          )}
          {claim.decision_note && <p className="mt-2 rounded-lg bg-black/5 p-3 text-sm">{claim.decision_note}</p>}
        </section>
      )}
      {!claim && order.status === "delivered" && (
        <p className="mt-6 text-sm">
          Un souci avec votre commande ?{" "}
          <Link href={`/commandes/${order.id}/reclamation`} className="font-medium text-brand-red underline">Signaler un problème</Link>
        </p>
      )}

      <section aria-labelledby="articles" className="mt-6">
        <h2 id="articles" className="mb-2 text-lg font-semibold">Articles</h2>
        <ul className="divide-y divide-black/10 rounded-xl border border-black/10">
          {(order.lines ?? []).map((line) => (
            <li key={line.product_id} className="flex justify-between gap-3 p-3 text-sm">
              <span>
                {line.name}{" "}
                <span className="text-black/50">
                  ({formatQuantity({ saleUnit: (line.sale_unit ?? "piece") as "piece" | "kg" | "l", quantity: line.quantity })})
                </span>
              </span>
              <span>{formatXof(line.line_total_minor)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 grid grid-cols-[1fr_auto] gap-1 text-sm">
          <dt>Sous-total</dt>
          <dd className="text-right">{formatXof(order.subtotal_minor ?? 0)}</dd>
          <dt>{order.fulfillment === "delivery" ? "Livraison" : "Retrait en magasin"}</dt>
          <dd className="text-right">{order.delivery_fee_minor ? formatXof(order.delivery_fee_minor) : "Offert"}</dd>
          <dt className="font-bold">Total TTC</dt>
          <dd className="text-right font-bold">{formatXof(order.total_minor)}</dd>
        </dl>
      </section>

      <section aria-labelledby="suivi" className="mt-8">
        <h2 id="suivi" className="mb-2 text-lg font-semibold">Suivi</h2>
        <ol className="border-l-2 border-brand-green/40 pl-4">
          {[...(order.history ?? [])].reverse().map((entry, index) => (
            <li key={`${entry.to_status}-${entry.created_at}-${index}`} className="mb-3">
              <p className="font-medium">{statusLabel(entry.to_status)}</p>
              <p className="text-xs text-black/60">
                {entry.created_at ? dateTime.format(new Date(entry.created_at)) : ""}
                {entry.reason ? ` — ${entry.reason}` : ""}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {canPay(order.status) && <p className="text-sm text-black/70">Paiement en attente : votre commande est réservée quelques minutes.</p>}
        {canCancel(order.status) && <CancelOrderButton orderId={order.id} />}
        <Link href="/commandes" className="text-sm text-brand-green underline">Toutes mes commandes</Link>
      </div>
    </>
  );
}
