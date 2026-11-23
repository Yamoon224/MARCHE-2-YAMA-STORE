
"use client";

import { useSyncExternalStore } from "react";
import {
  THEME_STORAGE_KEY,
  THEME_CHANGE_EVENT,
  type ThemePreference,
} from "@/lib/theme/theme";

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
}

function getSnapshot(): ThemePreference {
  return "light";
}

function getServerSnapshot(): ThemePreference {
  return "light";
}

function useThemePreference(): ThemePreference {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
}

// Force Light, sans possibilité de choisir un autre thème.
function choose(_preference?: ThemePreference) {
  const root = document.documentElement;

  root.dataset.theme = "light";
  root.dataset.themePref = "light";
  root.style.colorScheme = "only light";

  try {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
  } catch (e) {}

  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function ThemeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

/**
 * Sélecteur de thème désactivé : Light uniquement.
 * Le composant est conservé pour assurer la compatibilité avec les anciens imports.
 */
export function ThemeToggle({
  variant = "cycle",
  className = "",
}: {
  variant?: "cycle" | "segmented";
  className?: string;
}) {
  const preference = useThemePreference();

  if (variant === "segmented") {
    return (
      <div
        role="radiogroup"
        aria-label="Thème d'affichage"
        className={`grid grid-cols-1 gap-1.5 ${className}`}
      >
        <button
          type="button"
          role="radio"
          aria-checked="true"
          onClick={() => choose("light")}
          className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl border border-brand-red bg-brand-red/10 px-1 py-1.5 text-[11px] font-bold text-brand-red"
        >
          <ThemeIcon size={18} />
          Clair
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => choose("light")}
      aria-label="Thème clair activé"
      title="Thème clair"
      className={`grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/20 text-white hover:bg-white/30 ${className}`}
    >
      <ThemeIcon />
    </button>
  );
}
