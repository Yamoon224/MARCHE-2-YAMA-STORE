import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ClaimForm } from "@/components/orders/ClaimForm";
import { serverApi } from "@/lib/server/backend";

export const metadata = { title: "Signaler un problème — Marché de Yama" };

type Props = { params: Promise<{ id: string }> };

export default function ReclamationPage(props: Props) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Signaler un problème</h1>
      <Suspense fallback={<p className="text-black/60">Chargement…</p>}>
        <Content {...props} />
      </Suspense>
    </main>
  );
}

async function Content({ params }: Props) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const api = await serverApi();
  const [order, claims] = await Promise.all([
    api.GET("/api/v1/orders/{order}", { params: { path: { order: Number(id) } } }).catch(() => null),
    api.GET("/api/v1/claims").catch(() => null),
  ]);

  if (order?.response.status === 401) redirect(`/connexion?next=/commandes/${id}/reclamation`);
  if (order?.response.status === 403 || order?.response.status === 404) notFound();

  const data = order?.data?.data;
  if (!data) return <p role="status" className="rounded-lg bg-black/5 p-3">Service momentanément indisponible. Réessayez dans un instant.</p>;

  // Une seule réclamation par commande : si elle existe déjà, on renvoie vers son suivi.
  if (claims?.data?.data.some((c) => c.order_id === data.id)) redirect(`/commandes/${id}`);

  if (data.status !== "delivered") {
    return (
      <p role="status" className="rounded-lg bg-black/5 p-3">
        Une réclamation n&apos;est possible qu&apos;une fois la commande livrée.{" "}
        <Link href={`/commandes/${id}`} className="text-brand-green underline">Retour à la commande</Link>
      </p>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-black/70">
        Commande {data.number}. Vous avez 48 heures après la livraison pour nous signaler un article manquant, abîmé, périmé ou non conforme.
      </p>
      <ClaimForm orderId={data.id} lines={data.lines ?? []} />
    </>
  );
}
