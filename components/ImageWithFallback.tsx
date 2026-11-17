"use client";

import { useState } from "react";

/** Image de l'API ; si elle manque ou ne charge pas, visuel de marque de la maquette (jamais d'emplacement cassé). */
export function ImageWithFallback({ src, className = "" }: { src?: string | null; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className={`grid place-items-center bg-gradient-to-br from-[#fff0d5] via-[#f6d9a6] to-[#e8f0d8] p-2 text-center text-[11px] font-extrabold tracking-wider text-[#27613a] ${className}`}
      >
        🌿 MARCHÉ DE YAMA
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- images de l'API, domaines inconnus à la compilation
    <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className={`block bg-[#f4f0e8] object-cover ${className}`} />
  );
}
