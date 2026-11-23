
export const THEME_STORAGE_KEY = "yama-theme";
export const THEME_CHANGE_EVENT = "yama-theme-change";

export type ThemePreference = "light";
export type ResolvedTheme = "light";

export const THEME_PREFERENCES = ["light"] as const;

export const THEME_LABEL = {
  light: "Clair",
} as const;

// Toujours retourner Light
export function parseTheme(_value: unknown): ThemePreference {
  return "light";
}

// Aucun thème système autorisé
export function resolveTheme(
  _preference: ThemePreference,
  _systemDark: boolean
): ResolvedTheme {
  return "light";
}

// Aucun changement de thème possible
export function nextTheme(_preference: ThemePreference): ThemePreference {
  return "light";
}

// Force Light sur le document
export function applyTheme(
  root: HTMLElement,
  _preference: ThemePreference,
  _systemDark: boolean
): ResolvedTheme {
  root.dataset.themePref = "light";
  root.dataset.theme = "light";
  root.style.colorScheme = "only light";

  return "light";
}

// Exécuté avant l'hydratation
export function themeInitScript(): string {
  return `
    (function() {
      var root = document.documentElement;

      root.dataset.themePref = "light";
      root.dataset.theme = "light";
      root.style.colorScheme = "only light";

      try {
        localStorage.setItem(
          "${THEME_STORAGE_KEY}",
          "light"
        );
      } catch(e) {}
    })();
  `;
}

// Toujours retourner Light
export function readStoredTheme(): ThemePreference {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
  } catch(e) {}

  return "light";
}

// Toujours enregistrer Light
export function storeTheme(_preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
  } catch(e) {}
}
