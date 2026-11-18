"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import type { Banner } from "@/lib/catalog/types";

// Voile crème de la maquette : le texte reste lisible quelle que soit l'image de la bannière.
const VEIL = "linear-gradient(90deg, rgba(255,244,211,.98) 0%, rgba(255,237,192,.9) 43%, rgba(255,226,174,.08) 78%)";

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

  // Balayage horizontal au doigt : un geste franc, plus horizontal que vertical, change de diapositive.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (event: TouchEvent) => {
    setPaused(true);
    touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  };
  const onTouchEnd = (event: TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    setPaused(false);
    if (!start || count < 2) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? current + 1 : current - 1);
  };

  if (count === 0) return null;

  return (
    <section
      aria-roledescription="carrousel"
      aria-label="Offres et nouveautés"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative mx-auto mt-4 min-h-[360px] w-[min(1200px,calc(100%-22px))] overflow-hidden rounded-[22px] bg-[#e8c78d] shadow-soft sm:mt-6 sm:min-h-[360px] sm:w-[min(1200px,calc(100%-44px))] sm:rounded-[28px]"
    >
      {banners.map((s, i) => (
        <div
          key={s.id}
          aria-hidden={i !== current}
          className={`absolute inset-0 bg-cover bg-[58%_center] transition-[opacity,visibility] duration-700 sm:bg-center ${i === current ? "visible opacity-100" : "invisible opacity-0"}`}
          style={{ backgroundImage: s.imageUrl ? `${VEIL}, url(${s.imageUrl})` : VEIL }}
        >
          <div className="relative z-10 max-w-[620px] px-[22px] pb-[64px] pt-[34px] sm:px-[6%] lg:px-[84px] sm:pb-[70px] sm:pt-[58px]">
            {s.eyebrow && (
              <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[1.5px] text-brand-green">
                <span aria-hidden="true" className="h-[3px] w-6 rounded bg-brand-green" />
                {s.eyebrow}
              </div>
            )}
            {i === 0 ? (
              <h1 className="mb-3.5 mt-4 max-w-[330px] text-[clamp(30px,9vw,37px)] font-extrabold leading-[1.02] tracking-[-1.8px] text-[#154d2b] sm:max-w-[550px] sm:text-[clamp(38px,5vw,62px)] sm:tracking-[-2.5px]">
                {s.title}
              </h1>
            ) : (
              <p className="mb-3.5 mt-4 max-w-[330px] font-display text-[clamp(30px,9vw,37px)] font-extrabold leading-[1.02] tracking-[-1.8px] text-[#154d2b] sm:max-w-[550px] sm:text-[clamp(38px,5vw,62px)] sm:tracking-[-2.5px]">
                {s.title}
              </p>
            )}
            {s.text && <p className="mb-6 max-w-[290px] text-sm leading-relaxed text-[#4d4a35] sm:max-w-[390px] sm:text-base">{s.text}</p>}
            <Link
              href={s.ctaUrl}
              className="inline-flex min-h-12 items-center gap-3.5 rounded-full bg-brand-red px-[22px] py-3 font-extrabold text-white shadow-[0_8px_18px_#c9001b35] transition hover:-translate-y-[3px] hover:bg-brand-red-dark"
            >
              {s.ctaLabel} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      ))}
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Diapositive précédente"
            onClick={() => go(current - 1)}
            className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 rounded-full border border-white/60 bg-white/70 text-xl text-[#4c3b22] backdrop-blur hover:scale-110 hover:bg-white lg:block"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Diapositive suivante"
            onClick={() => go(current + 1)}
            className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 rounded-full border border-white/60 bg-white/70 text-xl text-[#4c3b22] backdrop-blur hover:scale-110 hover:bg-white lg:block"
          >
            ›
          </button>
          <div className="absolute bottom-0 left-1/2 z-20 flex -translate-x-1/2">
            {banners.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Diapositive ${i + 1}`}
                aria-current={i === current}
                onClick={() => setCurrent(i)}
                className="grid h-11 min-w-8 place-items-center"
              >
                <span aria-hidden="true" className={`block h-[9px] rounded-full transition-all ${i === current ? "w-[26px] bg-brand-red" : "w-[9px] bg-white/80 shadow-[0_0_0_1px_#0002]"}`} />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
