"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { extractApiError } from "@/lib/checkout/checkout";
import {
  buildClaimFormData, ISSUE_LABEL, ISSUES, MAX_PHOTOS, unitSuffix, validateDraft, type DraftLine, type Issue, type SaleUnit,
} from "@/lib/claims/claims";

export type ClaimableLine = { id: number; name: string; sale_unit?: string | null; quantity: number; received_quantity?: number | null };

const field = "min-h-11 rounded-lg border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green";

export function ClaimForm({ orderId, lines }: { orderId: string; lines: ClaimableLine[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftLine[]>(() =>
    lines.map((l) => ({
      orderLineId: l.id, name: l.name, saleUnit: (l.sale_unit ?? "piece") as SaleUnit,
      // Ce que le client a réellement reçu (après préparation), pas ce qu'il avait commandé.
      received: l.received_quantity ?? l.quantity, selected: false, issue: "damaged" as Issue, quantity: "1", note: "",
    })),
  );
  const [photos, setPhotos] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const patch = (index: number, change: Partial<DraftLine>) => setDraft((d) => d.map((l, i) => (i === index ? { ...l, ...change } : l)));

  function onPhotos(event: ChangeEvent<HTMLInputElement>) {
    setPhotos(Array.from(event.target.files ?? []));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const problem = validateDraft(draft, photos);
    if (problem) return setError(problem);

    setBusy(true);
    try {
      // multipart direct : les photos passent par le relais, qui ajoute le jeton du cookie httpOnly.
      const response = await fetch(`/api/backend/api/v1/orders/${orderId}/claims`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: buildClaimFormData(draft, photos, description),
      });

      if (!response.ok) return setError(extractApiError(await response.json().catch(() => null)));

      router.push(`/orders/${orderId}?reclamation=ok`);
      router.refresh();
    } catch {
      setError("Service momentanément indisponible. Vos informations sont conservées, réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <fieldset className="min-w-0 rounded-xl border border-black/10 p-3.5 sm:p-4">
        <legend className="px-1 font-semibold">1. Quels articles posent problème ?</legend>
        <ul className="mt-2 flex flex-col gap-4">
          {draft.map((line, index) => (
            <li key={line.orderLineId} className="rounded-lg border border-black/10 p-3">
              <label className="flex min-h-11 items-center gap-2 font-medium">
                <input type="checkbox" checked={line.selected} onChange={(e) => patch(index, { selected: e.target.checked })} />
                {line.name} <span className="font-normal text-black/50">(reçu : {line.received} {unitSuffix(line.saleUnit)})</span>
              </label>

              {line.selected && (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="text-sm font-medium">Problème
                    <select value={line.issue} onChange={(e) => patch(index, { issue: e.target.value as Issue })} className={`${field} mt-1 block w-full`}>
                      {ISSUES.map((i) => <option key={i} value={i}>{ISSUE_LABEL[i]}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-medium">Quantité concernée ({unitSuffix(line.saleUnit)})
                    <input value={line.quantity} onChange={(e) => patch(index, { quantity: e.target.value })} inputMode="decimal" placeholder="Ex. 1" className={`${field} mt-1 block w-full`} />
                  </label>
                  <label className="text-sm font-medium">Précision (facultatif)
                    <input value={line.note} onChange={(e) => patch(index, { note: e.target.value })} maxLength={255} placeholder="Ex. emballage percé" className={`${field} mt-1 block w-full`} />
                  </label>
                </div>
              )}
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="min-w-0 rounded-xl border border-black/10 p-3.5 sm:p-4">
        <legend className="px-1 font-semibold">2. Photos et détails</legend>
        <label className="mt-2 block text-sm font-medium">
          Photos (JPEG, PNG ou WebP, {MAX_PHOTOS} maximum, 4 Mo chacune)
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onPhotos} className="mt-1 block w-full text-sm file:mr-3 file:min-h-11 file:rounded-full file:border-0 file:bg-brand-green file:px-4 file:font-bold file:text-white" />
        </label>
        {photos.length > 0 && <p className="mt-1 text-xs text-black/60">{photos.length} photo(s) sélectionnée(s).</p>}
        <label className="mt-3 block text-sm font-medium">Description (facultatif)
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={3} placeholder="Décrivez ce qui s'est passé…" className={`${field} mt-1 block w-full`} />
        </label>
      </fieldset>

      {error && <p role="alert" className="rounded-lg bg-brand-red/10 p-3 text-sm text-brand-red">{error}</p>}

      <button type="submit" disabled={busy} className="min-h-12 w-full rounded-full bg-brand-red px-6 py-3 font-extrabold text-white hover:bg-brand-red-dark disabled:opacity-60 sm:w-fit">
        {busy ? "Envoi…" : "Envoyer ma réclamation"}
      </button>
    </form>
  );
}
