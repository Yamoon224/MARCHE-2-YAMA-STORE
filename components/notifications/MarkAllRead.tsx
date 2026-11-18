"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserApi } from "@/lib/api/client";

export function MarkAllRead() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function markAll() {
    setBusy(true);
    setError(false);

    try {
      const { error: failure } = await browserApi().POST("/api/v1/notifications/read-all");
      if (failure) return setError(true);

      router.refresh();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="flex items-center gap-3">
      {error && <span role="alert" className="text-sm text-brand-red">Impossible pour le moment. Réessayez.</span>}
      <button type="button" onClick={markAll} disabled={busy} className="min-h-11 rounded-full border border-black/20 px-4 text-sm hover:bg-black/5 disabled:opacity-60">
        {busy ? "Un instant…" : "Tout marquer comme lu"}
      </button>
    </span>
  );
}
