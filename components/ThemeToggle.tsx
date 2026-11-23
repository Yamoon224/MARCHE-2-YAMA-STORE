"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  applyTheme,
  nextTheme,
  parseTheme,
  readStoredTheme,
  storeTheme,
  THEME_CHANGE_EVENT,
  THEME_LABEL,
  THEME_PREFERENCES,
  type ThemePreference,
} from "@/lib/theme/theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function systemDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
}

/** Le choix en cours : lu sur <html>, où le script de démarrage l'a posé avant l'hydratation. Le serveur ne le connaît pas. */
function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribe, () => parseTheme(document.documentElement.dataset.themePref), () => "auto");
}

function choose(preference: ThemePreference) {
  storeTheme(preference);
  applyTheme(document.documentElement, preference, systemDark());
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

/** Garde la page à jour quand l'appareil change de thème (mode automatique) ou qu'un autre onglet change le choix. */
function useThemeSync() {
  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const onSystem = () => applyTheme(document.documentElement, parseTheme(document.documentElement.dataset.themePref), query.matches);
    const onStorage = () => {
      applyTheme(document.documentElement, readStoredTheme(), query.matches);
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    };

    query.addEventListener("change", onSystem);
    window.addEventListener("storage", onStorage);

    return () => {
      query.removeEventListener("change", onSystem);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
}

function ThemeIcon({ preference, size = 20 }: { preference: ThemePreference; size?: number }) {
  const common = { viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

  if (preference === "light") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  }

  // if (preference === "dark") {
  //   return (
  //     <svg {...common}>
  //       <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  //     </svg>
  //   );
  // }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18" />
      <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Sélecteur de thème (clair, sombre, automatique), enregistré sur l'appareil.
 * « cycle » : un bouton rond pour l'en-tête, qui passe au choix suivant. « segmented » : les trois choix côte à côte (tiroir mobile).
 */
export function ThemeToggle({ variant = "cycle", className = "" }: { variant?: "cycle" | "segmented"; className?: string }) {
  const preference = useThemePreference();
  useThemeSync();

  if (variant === "segmented") {
    return (
      <div role="radiogroup" aria-label="Thème d'affichage" className={`grid grid-cols-3 gap-1.5 ${className}`}>
        {THEME_PREFERENCES.map((option) => {
          const checked = option === preference;

          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => choose(option)}
              className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl border px-1 py-1.5 text-[11px] font-bold ${
                checked ? "border-brand-red bg-brand-red/10 text-brand-red" : "border-line text-foreground hover:bg-black/5"
              }`}
            >
              <ThemeIcon preference={option} size={18} />
              {THEME_LABEL[option]}
            </button>
          );
        })}
      </div>
    );
  }

  const next = nextTheme(preference);
  const label = `Thème : ${THEME_LABEL[preference]}. Passer au thème ${THEME_LABEL[next].toLowerCase()}`;

  return (
    <button
      type="button"
      onClick={() => choose(next)}
      aria-label={label}
      title={label}
      className={`h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/20 text-white hover:bg-white/30 ${className}`}
    >
      <ThemeIcon preference={preference} />
    </button>
  );
}
