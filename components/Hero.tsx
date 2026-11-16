"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Banner } from "@/lib/catalog/types";

const GRADIENTS = [
  "from-[#3b2a1a] via-[#7a3b12] to-[#c9001b]",
  "from-[#154d2b] via-[#087b35] to-[#3f7d2c]",
  "from-[#4a2b00] via-[#a35a00] to-[#f2b705]",
];

const PERKS = [
  "🚚 Livraison à Paris et en Île-de-France",
  "💳 Carte Visa / Mastercard ou espèces à la réception",
  "🌿 Fraîcheur garantie, suivi par lot",
];

export function Hero({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const count = banners.length;
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (count < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setCurrent((c) => (c + 1) % Math.max(count, 1)), 5000);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  const go = (n: number) => setCurrent((n + count) % count);

  return (
    <>
      {count > 0 && (
      <section
        aria-roledescription="carrousel"
        aria-label="Offres"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative mx-auto mt-5 h-[430px] w-[min(1200px,calc(100%-28px))] overflow-hidden rounded-[18px] bg-[#3b2a1a] shadow-soft sm:h-[clamp(400px,50vw,520px)] sm:rounded-3xl"
      >
        {banners.map((s, i) => (
          <div
            key={s.title}
            aria-hidden={i !== current}
            className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} bg-cover bg-center transition-[opacity,visibility] duration-700 ${i === current ? "visible opacity-100" : "invisible opacity-0"}`}
            style={s.imageUrl ? { backgroundImage: `linear-gradient(90deg, #1d0d06ee, #1d0d0699 55%, #0000), url(${s.imageUrl})` } : undefined}
          >
            <div className="absolute inset-x-5 bottom-12 z-10 text-white sm:inset-x-auto sm:bottom-auto sm:left-[6%] sm:top-1/2 sm:max-w-[540px] sm:-translate-y-1/2">
              {i === 0 ? (
                <h1 className="mb-3.5 text-[clamp(30px,4.6vw,56px)] font-extrabold">{s.title}</h1>
              ) : (
                <p className="mb-3.5 font-display text-[clamp(30px,4.6vw,56px)] font-extrabold leading-[1.1]">{s.title}</p>
              )}
              {s.text && <p className="mb-6 max-w-[440px] text-[#fff0dd] sm:text-[17px]">{s.text}</p>}
              <Link
                href={s.ctaUrl}
                className="inline-flex rounded-full bg-brand-gold px-6 py-3 font-extrabold text-[#4a2b00] transition hover:-translate-y-0.5"
              >
                {s.ctaLabel}
              </Link>
            </div>
          </div>
        ))}
        <button
          type="button"
          aria-label="Précédent"
          onClick={() => go(current - 1)}
          className="absolute left-3.5 top-1/2 z-20 hidden h-[42px] w-[42px] -translate-y-1/2 rounded-full bg-white/80 text-2xl sm:block"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Suivant"
          onClick={() => go(current + 1)}
          className="absolute right-3.5 top-1/2 z-20 hidden h-[42px] w-[42px] -translate-y-1/2 rounded-full bg-white/80 text-2xl sm:block"
        >
          ›
        </button>
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {banners.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={`Diapositive ${i + 1}`}
              aria-current={i === current}
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full ${i === current ? "w-7 bg-brand-gold" : "w-2.5 bg-white/60"}`}
            />
          ))}
        </div>
      </section>
      )}
      <ul className="mx-auto my-4 grid w-[min(1200px,calc(100%-28px))] gap-2 text-sm sm:grid-cols-3 sm:gap-3">
        {PERKS.map((p) => (
          <li key={p} className="rounded-[14px] border border-line bg-white px-4 py-3">
            {p}
          </li>
        ))}
      </ul>
    </>
  );
}
