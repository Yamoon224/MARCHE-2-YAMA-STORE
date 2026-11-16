"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { browserApi } from "@/lib/api/client";
import { formatQuantity, lineTotalMinor } from "@/lib/cart/cart";
import { useCart } from "@/lib/cart/CartProvider";
import {
  belowMinimum, buildOrderPayload, estimateDeliveryFee, extractApiError, validateForm,
  type CheckoutForm, type PaymentMethod, type Zone,
} from "@/lib/checkout/checkout";
import { formatXof } from "@/lib/format";

type Slot = { id: number; starts_at: string; ends_at: string; remaining: number };

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  mobile_money: "Mobile money (Orange, MTN, Moov, Wave)",
  card: "Carte bancaire",
  cash_on_delivery: "Paiement à la livraison",
};

const slotFormat = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
const hourFormat = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

export function CheckoutView() {
  const router = useRouter();
  const { cart, ready, subtotalMinor, clear } = useCart();
  const api = useMemo(() => browserApi(), []);

  const [signedIn, setSignedIn] = useState<boolean | undefined>(undefined);
  const [zones, setZones] = useState<Zone[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [form, setForm] = useState<CheckoutForm>({ fulfillment: "pickup", zoneId: null, slotId: null, neighborhood: "", landmark: "", phone: "" });
  const [method, setMethod] = useState<PaymentMethod>("mobile_money");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Une clé par tentative (créée à la soumission, pas au rendu) : un double clic ou un rejeu réseau ne crée jamais deux commandes.
  const attempt = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((body: { user: unknown }) => {
        if (body.user) setSignedIn(true);
        else router.replace("/connexion?next=/commande");
      })
      .catch(() => setSignedIn(false));
  }, [router]);

  useEffect(() => {
    api.GET("/api/v1/delivery/zones").then(({ data }) => setZones((data?.data ?? []) as Zone[]));
  }, [api]);

  useEffect(() => {
    if (form.zoneId === null) return;
    let cancelled = false;

    api.GET("/api/v1/delivery/zones/{zone}/slots", { params: { path: { zone: form.zoneId } } }).then(({ data }) => {
      if (!cancelled) setSlots((data?.data ?? []) as Slot[]);
    });

    return () => {
      cancelled = true;
    };
  }, [api, form.zoneId]);

  const zone = zones.find((z) => z.id === form.zoneId);
  const delivery = form.fulfillment === "delivery";
  const fee = delivery ? estimateDeliveryFee(zone, subtotalMinor) : 0;
  const tooSmall = delivery && belowMinimum(zone, subtotalMinor);

  function patch(change: Partial<CheckoutForm>) {
    attempt.current = null; // le contenu change : nouvelle tentative, nouvelle clé
    setForm((current) => ({ ...current, ...change }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const problem = validateForm(form) ?? (tooSmall && zone ? `Le montant minimum pour cette zone est de ${formatXof(zone.min_order_minor)}.` : null);
    if (problem) return setError(problem);

    setBusy(true);
    const key = (attempt.current ??= crypto.randomUUID());
    try {
      const order = await api.POST("/api/v1/orders", {
        body: buildOrderPayload(cart, form),
        params: { header: { "Idempotency-Key": key } },
      });

      if (order.error || !order.data) return setError(extractApiError(order.error));
      const orderId = order.data.data?.id as number;

      const payment = await api.POST("/api/v1/orders/{orderId}/payments", {
        params: { path: { orderId }, header: { "Idempotency-Key": `${key}-pay` } },
        body: { method },
      });

      clear();
      // La commande existe même si l'ouverture du paiement échoue : le client peut le relancer depuis son suivi.
      router.push(`/commandes/${orderId}${payment.error ? "?paiement=erreur" : `?paiement=${method}`}`);
    } catch {
      setError("Service momentanément indisponible. Votre panier est conservé, réessayez.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready || signedIn === undefined) return <p className="text-black/60">Chargement…</p>;

  if (cart.lines.length === 0) {
    return (
      <p>
        Votre panier est vide.{" "}
        <Link href="/rayons" className="text-brand-red underline">Voir nos produits</Link>
      </p>
    );
  }

  const input = "mt-1 w-full rounded-lg border border-black/20 px-3 py-2 outline-none focus:border-brand-green";

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_20rem]" noValidate>
      <div className="flex flex-col gap-6">
        <fieldset className="rounded-xl border border-black/10 p-4">
          <legend className="px-1 font-semibold">1. Réception</legend>
          <div className="mt-2 flex gap-4">
            {(["pickup", "delivery"] as const).map((value) => (
              <label key={value} className="flex items-center gap-2">
                <input type="radio" name="fulfillment" checked={form.fulfillment === value} onChange={() => patch({ fulfillment: value })} />
                {value === "pickup" ? "Retrait en magasin (gratuit)" : "Livraison à domicile"}
              </label>
            ))}
          </div>

          {delivery && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Zone
                <select className={input} value={form.zoneId ?? ""} onChange={(e) => patch({ zoneId: e.target.value ? Number(e.target.value) : null, slotId: null })}>
                  <option value="">Choisir…</option>
                  {zones.map((z) => <option key={z.id} value={z.id}>{z.name} — {formatXof(z.fee_minor)}</option>)}
                </select>
              </label>

              <label className="text-sm font-medium">
                Créneau
                <select className={input} value={form.slotId ?? ""} disabled={form.zoneId === null} onChange={(e) => patch({ slotId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">{form.zoneId === null ? "Choisissez d'abord une zone" : slots.length ? "Choisir…" : "Aucun créneau disponible"}</option>
                  {slots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {slotFormat.format(new Date(s.starts_at))} – {hourFormat.format(new Date(s.ends_at))} ({s.remaining} place{s.remaining > 1 ? "s" : ""})
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                Quartier
                <input className={input} value={form.neighborhood} onChange={(e) => patch({ neighborhood: e.target.value })} autoComplete="address-level2" placeholder="Ex. Cocody Angré" />
              </label>

              <label className="text-sm font-medium">
                Téléphone du destinataire
                <input className={input} value={form.phone} onChange={(e) => patch({ phone: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="+225 07 00 00 00 00" />
              </label>

              <label className="text-sm font-medium sm:col-span-2">
                Repère (facultatif)
                <input className={input} value={form.landmark} onChange={(e) => patch({ landmark: e.target.value })} placeholder="Ex. derrière la pharmacie, portail bleu" />
              </label>
            </div>
          )}
        </fieldset>

        <fieldset className="rounded-xl border border-black/10 p-4">
          <legend className="px-1 font-semibold">2. Paiement</legend>
          <div className="mt-2 flex flex-col gap-2">
            {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((value) => (
              <label key={value} className="flex items-center gap-2">
                <input type="radio" name="method" checked={method === value} onChange={() => setMethod(value)} />
                {PAYMENT_LABELS[value]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-xl border border-black/10 p-4">
        <h2 className="text-lg font-semibold">Votre commande</h2>
        <ul className="mt-3 flex flex-col gap-1 text-sm">
          {cart.lines.map((l) => (
            <li key={l.productId} className="flex justify-between gap-2">
              <span>{l.name} <span className="text-black/50">({formatQuantity(l)})</span></span>
              <span>{formatXof(lineTotalMinor(l))}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between border-t border-black/10 pt-3"><span>Sous-total</span><span>{formatXof(subtotalMinor)}</span></p>
        <p className="flex justify-between"><span>Livraison</span><span>{delivery && !zone ? "—" : fee === 0 ? "Offerte" : formatXof(fee)}</span></p>
        <p className="mt-1 flex justify-between text-lg font-bold"><span>Total TTC</span><span>{formatXof(subtotalMinor + fee)}</span></p>
        <p className="mt-1 text-xs text-black/60">Montant définitif calculé par le serveur à la validation.</p>

        {tooSmall && zone && (
          <p role="alert" className="mt-3 text-sm text-brand-red">Minimum de commande pour cette zone : {formatXof(zone.min_order_minor)}.</p>
        )}
        {error && <p role="alert" className="mt-3 rounded-lg bg-brand-red/10 p-3 text-sm text-brand-red">{error}</p>}

        <button type="submit" disabled={busy} className="mt-4 w-full rounded-full bg-brand-red py-2.5 font-medium text-white disabled:opacity-60">
          {busy ? "Validation…" : "Confirmer la commande"}
        </button>
      </aside>
    </form>
  );
}
