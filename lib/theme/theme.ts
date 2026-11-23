export const THEME_STORAGE_KEY = "yama-theme";
export const THEME_CHANGE_EVENT = "yama-theme-change";

export type ThemePreference = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

export const THEME_PREFERENCES: readonly ThemePreference[] = ["light", "dark", "auto"];

export const THEME_LABEL: Record<ThemePreference, string> = {
  light: "Clair",
  dark: "Sombre",
  auto: "Automatique",
};

/** Une valeur inconnue (ou absente) revient à « automatique » : on suit le réglage de l'appareil. */
export function parseTheme(value: unknown): ThemePreference {
  return value === "light" || value === "dark" || value === "auto"
    ? value
    : "light";
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  if (preference === "auto") return systemDark ? "dark" : "light";
  return preference;
}

/** Ordre du bouton à bascule : clair, sombre, automatique, puis retour au clair. */
export function nextTheme(preference: ThemePreference): ThemePreference {
  return THEME_PREFERENCES[(THEME_PREFERENCES.indexOf(preference) + 1) % THEME_PREFERENCES.length];
}

/** Pose le thème sur <html> : data-theme-pref (le choix), data-theme (clair/sombre effectif) et color-scheme. */
export function applyTheme(root: HTMLElement, preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  const resolved = resolveTheme(preference, systemDark);

  root.dataset.themePref = preference;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;

  return resolved;
}

/**
 * Script lu avant l'hydratation (dans <head>) : il pose le thème avant le premier affichage, sans flash.
 * Il reprend la logique de parseTheme / resolveTheme / applyTheme, en JavaScript autonome.
 */
export function themeInitScript(): string {
  return `(function(){try{var p=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(p!=="light"&&p!=="dark")p="auto";var d=p==="dark"||(p==="auto"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.dataset.themePref=p;r.dataset.theme=d?"dark":"light";r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
}

export function readStoredTheme(): ThemePreference {
  try {
    return parseTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "auto";
  }
}

export function storeTheme(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Stockage indisponible (navigation privée, cookies bloqués) : le choix vaut pour la page en cours.
  }
}
