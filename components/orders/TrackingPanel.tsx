"use client";

import { useEffect, useMemo, useState } from "react";
import { browserApi } from "@/lib/api/client";
import { formatAge, formatCode, mapsUrl, nextPollDelay, TRACKING_LABEL, type DeliveryStatus } from "@/lib/tracking/tracking";

type Tracking = {
  status: DeliveryStatus;
  courier_name?: string | null;
  confirmation_code?: string | null;
  location?: { latitude: number; longitude: number; recorded_at: string } | null;
};

/** Suivi de livraison : interroge le serveur à intervalle adapté, et s'arrête quand la livraison est terminée. */
export function TrackingPanel({ orderId }: { orderId: number }) {
  const api = useMemo(() => browserApi(), []);
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function load() {
      // Onglet masqué : on ne sollicite ni le serveur ni la batterie, on réessaie plus tard.
      if (document.visibilityState === "visible") {
        const { data, error } = await api.GET("/api/v1/orders/{orderId}/tracking", { params: { path: { orderId } } }).catch(() => ({ data: undefined, error: true }));

        if (cancelled) return;

        if (data) {
          setTracking(data.data as Tracking);
          setUnavailable(false);
          setNow(Date.now());

          const delay = nextPollDelay((data.data as Tracking).status);
          if (delay === null) return; // livraison terminée : plus rien à interroger
          timer = setTimeout(load, delay);
          return;
        }

        setUnavailable(Boolean(error));
      }

      timer = setTimeout(load, 30_000);
    }

    void load();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [api, orderId]);

  if (!tracking) {
    return unavailable ? <p role="status" className="rounded-lg bg-black/5 p-3 text-sm">Suivi momentanément indisponible.</p> : null;
  }

  return (
    <section aria-labelledby="livraison" className="mt-8 rounded-xl border border-brand-green/40 p-4">
      <h2 id="livraison" className="text-lg font-semibold">Livraison</h2>
      <p className="mt-1" aria-live="polite">{TRACKING_LABEL[tracking.status]}</p>
      {tracking.courier_name && <p className="mt-1 text-sm text-black/70">Livreur : <strong>{tracking.courier_name}</strong></p>}

      {tracking.confirmation_code && (
        <div className="mt-3 rounded-lg bg-brand-green/10 p-3 text-center">
          <p className="text-sm">Donnez ce code au livreur à la remise de votre commande</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-widest min-[400px]:text-3xl" aria-label={`Code de confirmation ${tracking.confirmation_code.split("").join(" ")}`}>
            {formatCode(tracking.confirmation_code)}
          </p>
          <p className="mt-1 text-xs text-black/60">Ne le communiquez qu&apos;en main propre, à votre livreur.</p>
        </div>
      )}

      {tracking.location && (
        <p className="mt-3 text-sm">
          Dernière position {formatAge(tracking.location.recorded_at, now)} -{" "}
          <a href={mapsUrl(tracking.location.latitude, tracking.location.longitude)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-medium text-brand-green underline">
            voir sur la carte
          </a>
        </p>
      )}
    </section>
  );
}
