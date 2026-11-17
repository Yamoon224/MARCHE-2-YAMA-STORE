import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MarkAllRead } from "@/components/notifications/MarkAllRead";
import { formatWhen } from "@/lib/notifications/notifications";
import { serverApi } from "@/lib/server/backend";

export const metadata = { title: "Mes notifications - Marché de Yama" };

export default function NotificationsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Mes notifications</h1>
      <Suspense fallback={<p className="text-black/60">Chargement…</p>}>
        <Feed />
      </Suspense>
    </main>
  );
}

async function Feed() {
  const api = await serverApi();
  const result = await api.GET("/api/v1/notifications").catch(() => null);

  if (result?.response.status === 401) redirect("/connexion?next=/notifications");

  if (!result?.data) {
    return <p role="status" className="rounded-lg bg-black/5 p-3 text-sm">Service momentanément indisponible. Réessayez dans un instant.</p>;
  }

  const items = result.data.data;
  const unread = result.data.meta.unread_count;

  if (items.length === 0) return <p className="text-black/70">Aucune notification pour le moment.</p>;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-black/70">{unread > 0 ? `${unread} non lue(s)` : "Tout est lu"}</p>
        {unread > 0 && <MarkAllRead />}
      </div>
      <ul className="divide-y divide-black/10 rounded-xl border border-black/10">
        {items.map((n) => (
          <li key={n.id} className={`p-4 ${n.read ? "" : "bg-brand-green/5"}`}>
            <p className="flex items-center justify-between gap-3">
              <span className={n.read ? "font-medium" : "font-semibold"}>{!n.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-brand-red" aria-label="Non lue" />}{n.title}</span>
              <time dateTime={n.created_at} className="shrink-0 text-xs text-black/50">{formatWhen(n.created_at)}</time>
            </p>
            <p className="mt-1 text-sm text-black/70">{n.body}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
