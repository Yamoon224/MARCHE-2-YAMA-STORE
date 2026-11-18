"use client";

import { useRef, useState } from "react";

/**
 * Galerie de la fiche produit : image principale (balayage au doigt, flèches au clavier) et vignettes défilantes.
 * Sans image, un visuel de remplacement évite tout emplacement vide.
 */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [current, setCurrent] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const touch = useRef<{ x: number; y: number } | null>(null);
  const count = images.length;

  const go = (n: number) => setCurrent(((n % count) + count) % count);

  if (count === 0) {
    return (
      <div className="grid aspect-[4/3] w-full place-items-center rounded-[22px] bg-[#f4ecd9] text-7xl shadow-soft sm:text-8xl">
        <span aria-hidden="true">🛒</span>
      </div>
    );
  }

  return (
    <div
      className="min-w-0"
      role="group"
      aria-roledescription="galerie"
      aria-label={`Photos de ${name}`}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(current - 1);
        if (event.key === "ArrowRight") go(current + 1);
      }}
    >
      <div
        className="relative aspect-[4/3] w-full touch-pan-y overflow-hidden rounded-[22px] bg-[#f4ecd9] shadow-soft"
        onTouchStart={(event) => {
          touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }}
        onTouchEnd={(event) => {
          const start = touch.current;
          touch.current = null;
          if (!start || count < 2) return;
          const dx = event.changedTouches[0].clientX - start.x;
          const dy = event.changedTouches[0].clientY - start.y;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? current + 1 : current - 1);
        }}
      >
        {failed[current] ? (
          <div className="grid h-full w-full place-items-center text-6xl" aria-hidden="true">
            🛒
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- images de l'API, domaines inconnus à la compilation
          <img
            key={images[current]}
            src={images[current]}
            alt={count > 1 ? `${name}, photo ${current + 1} sur ${count}` : name}
            onError={() => setFailed((f) => ({ ...f, [current]: true }))}
            className="h-full w-full object-cover"
            draggable={false}
          />
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Photo précédente"
              onClick={() => go(current - 1)}
              className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-white/80 text-xl text-[#4c3b22] backdrop-blur hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Photo suivante"
              onClick={() => go(current + 1)}
              className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-white/80 text-xl text-[#4c3b22] backdrop-blur hover:bg-white"
            >
              ›
            </button>
            <span aria-live="polite" className="absolute bottom-2 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-bold text-white">
              {current + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="scroll-row mt-3 flex snap-x gap-2 overflow-x-auto pb-1" aria-label="Vignettes">
          {images.map((src, index) => (
            <li key={src} className="shrink-0 snap-start">
              <button
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Afficher la photo ${index + 1}`}
                aria-current={index === current}
                className={`block h-16 w-16 overflow-hidden rounded-xl border-2 bg-[#f4ecd9] sm:h-20 sm:w-20 ${index === current ? "border-brand-green" : "border-transparent opacity-80 hover:opacity-100"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- images de l'API */}
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" draggable={false} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
