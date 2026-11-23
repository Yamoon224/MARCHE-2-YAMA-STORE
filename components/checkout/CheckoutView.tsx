"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { browserApi } from "@/lib/api/client";
import { formatQuantity, lineTotalMinor } from "@/lib/cart/cart";
import { useCart } from "@/lib/cart/CartProvider";
import {
  belowMinimum, buildOrderPayload, estimateDeliveryFee, extractApiError, validateForm,
  type CheckoutForm, type GuestContact, type PaymentMethod, type Zone, validateContact,
} from "@/lib/checkout/checkout";
import { formatMoney } from "@/lib/format";

import { CardIcon, CashIcon, ScooterIcon, StoreIcon } from "./icons";

type Slot = { id: number; starts_at: string; ends_at: string; remaining: number };

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card: "Carte bancaire - Visa ou Mastercard",
  cash_on_delivery: "Espèces - à la livraison ou au retrait en magasin",
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
  const [contact, setContact] = useState<GuestContact>({ name: "", email: "", phone: "" });
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Une clé par tentative (créée à la soumission, pas au rendu) : un double clic ou un rejeu réseau ne crée jamais deux commandes.
  const attempt = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((body: { user: unknown }) => {
        setSignedIn(Boolean(body.user));
      })
      .catch(() => setSignedIn(false));
  }, []);

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

    const problem = (signedIn ? null : validateContact(contact)) ?? validateForm(form) ?? (tooSmall && zone ? `Le montant minimum pour cette zone est de ${formatMoney(zone.min_order_minor)}.` : null);
    if (problem) return setError(problem);

    setBusy(true);
    const key = (attempt.current ??= crypto.randomUUID());
    try {
      // Sans compte : une session invité est ouverte d'abord (cookie httpOnly), puis la commande suit le parcours habituel.
      if (!signedIn) {
        const guest = await fetch("/api/session/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contact),
        });
        if (!guest.ok) return setError(extractApiError(await guest.json().catch(() => null), "Impossible de continuer sans compte."));
        setSignedIn(true);
      }

      const order = await api.POST("/api/v1/orders", {
        body: buildOrderPayload(cart, form),
        params: { header: { "Idempotency-Key": key } },
      });

      if (order.error || !order.data) return setError(extractApiError(order.error));
      const orderId = order.data.data?.id as string;

      const payment = await api.POST("/api/v1/orders/{orderId}/payments", {
        params: { path: { orderId }, header: { "Idempotency-Key": `${key}-pay` } },
        body: { method },
      });

      clear();

      // Carte : on envoie le client sur la page de paiement sécurisée (Stripe) ; il revient sur le suivi de commande ensuite.
      const payUrl = payment.data?.data?.action_url;
      if (payUrl) {
        window.location.assign(payUrl);
        return;
      }

      // La commande existe même si l'ouverture du paiement échoue : le client peut le relancer depuis son suivi.
      router.push(`/orders/${orderId}${payment.error ? "?paiement=erreur" : `?paiement=${method}`}`);
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
        <Link href="/aisles" className="text-brand-red underline">Voir nos produits</Link>
      </p>
    );
  }

  const input = "mt-1 min-h-11 w-full rounded-lg border border-black/20 bg-white px-3 py-2 outline-none focus:border-brand-green";

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-6" noValidate>
      <div className="flex flex-col gap-6">
        {!signedIn && (
          <fieldset className="min-w-0 rounded-xl border border-black/10 p-3.5 sm:p-4">
            <legend className="px-1 font-semibold">Vos coordonnées</legend>
            <p className="mt-1 text-sm text-black/60">
              Pas besoin de compte pour commander.{" "}
              <Link href="/login?next=/checkout" className="text-brand-red underline">J&apos;ai déjà un compte</Link>
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium sm:col-span-2">
                Nom complet
                <input className={input} value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} autoComplete="name" placeholder="Ex. Awa Koné" />
              </label>
              <label className="text-sm font-medium">
                E-mail
                <input className={input} type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} inputMode="email" autoComplete="email" placeholder="Ex. awa@exemple.com" />
              </label>
              <label className="text-sm font-medium">
                Téléphone
                <input className={input} type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="+33 6 12 34 56 78" />
              </label>
            </div>
          </fieldset>
        )}

        <fieldset className="min-w-0 rounded-xl border border-black/10 p-3.5 sm:p-4">
          <legend className="px-1 font-semibold">1. Réception</legend>
          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:gap-5">
            {(["pickup", "delivery"] as const).map((value) => (
              <label key={value} className="flex min-h-11 items-center gap-2">
                <input type="radio" name="fulfillment" checked={form.fulfillment === value} onChange={() => patch({ fulfillment: value })} />
                <span aria-hidden="true" className="text-brand-green">
                  {value === "pickup" ? <StoreIcon /> : <ScooterIcon />}
                </span>
                {value === "pickup" ? "Retrait en magasin (gratuit)" : "Livraison à domicile"}
              </label>
            ))}
          </div>

          {delivery && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Zone
                <select className={`${input} pr-8`} value={form.zoneId ?? ""} onChange={(e) => patch({ zoneId: e.target.value ? Number(e.target.value) : null, slotId: null })}>
                  <option value="">Choisir…</option>
                  {zones.map((z) => <option key={z.id} value={z.id}>{z.name} - {formatMoney(z.fee_minor)}</option>)}
                </select>
              </label>

              <label className="text-sm font-medium">
                Créneau
                <select className={`${input} pr-8`} value={form.slotId ?? ""} disabled={form.zoneId === null} onChange={(e) => patch({ slotId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">{form.zoneId === null ? "Choisissez d'abord une zone" : slots.length ? "Choisir…" : "Aucun créneau disponible"}</option>
                  {slots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {slotFormat.format(new Date(s.starts_at))} – {hourFormat.format(new Date(s.ends_at))} ({s.remaining} place{s.remaining > 1 ? "s" : ""})
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                Adresse de livraison
                <input className={input} value={form.neighborhood} onChange={(e) => patch({ neighborhood: e.target.value })} autoComplete="street-address" enterKeyHint="next" placeholder="Ex. 12 rue de Rivoli, 75004 Paris" />
              </label>

              <label className="text-sm font-medium">
                Téléphone du destinataire
                <input className={input} type="tel" value={form.phone} onChange={(e) => patch({ phone: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="+33 6 12 34 56 78" />
              </label>

              <label className="text-sm font-medium sm:col-span-2">
                Complément d&apos;adresse (facultatif)
                <input className={input} value={form.landmark} onChange={(e) => patch({ landmark: e.target.value })} placeholder="Ex. bâtiment B, 3e étage, digicode 1234A" />
              </label>
            </div>
          )}
        </fieldset>

        <fieldset className="min-w-0 rounded-xl border border-black/10 p-3.5 sm:p-4">
          <legend className="px-1 font-semibold">2. Paiement</legend>
          <div className="mt-2 flex flex-col gap-1">
            {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((value) => (
              <label key={value} className="flex min-h-11 items-center gap-2">
                <input type="radio" name="method" checked={method === value} onChange={() => setMethod(value)} />
                <span aria-hidden="true" className="text-brand-green">
                  {value === "card" ? <CardIcon /> : <CashIcon />}
                </span>
                {PAYMENT_LABELS[value]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-xl border border-black/10 bg-white p-4 lg:sticky lg:top-40">
        <h2 className="text-lg font-semibold">Votre commande</h2>
        <ul className="mt-3 flex flex-col gap-1 text-sm">
          {cart.lines.map((l) => (
            <li key={l.productId} className="flex justify-between gap-3">
              <span className="min-w-0 [overflow-wrap:anywhere]">{l.name} <span className="text-black/50">({formatQuantity(l)})</span></span>
              <span>{formatMoney(lineTotalMinor(l))}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between border-t border-black/10 pt-3"><span>Sous-total</span><span>{formatMoney(subtotalMinor)}</span></p>
        <p className="flex justify-between"><span>Livraison</span><span>{delivery && !zone ? "-" : fee === 0 ? "Offerte" : formatMoney(fee)}</span></p>
        <p className="mt-1 flex justify-between text-lg font-bold"><span>Total TTC</span><span>{formatMoney(subtotalMinor + fee)}</span></p>
        <p className="mt-1 text-xs text-black/60">Montant définitif calculé par le serveur à la validation.</p>

        {tooSmall && zone && (
          <p role="alert" className="mt-3 text-sm text-brand-red">Minimum de commande pour cette zone : {formatMoney(zone.min_order_minor)}.</p>
        )}
        {error && <p role="alert" className="mt-3 rounded-lg bg-brand-red/10 p-3 text-sm text-brand-red">{error}</p>}

        <button type="submit" disabled={busy} className="mt-4 min-h-12 w-full rounded-full bg-brand-red py-3 font-extrabold text-white hover:bg-brand-red-dark disabled:opacity-60">
          {busy ? "Validation…" : "Confirmer la commande"}
        </button>
      </aside>
    </form>
  );
}
