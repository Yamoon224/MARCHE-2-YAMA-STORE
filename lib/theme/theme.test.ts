import { describe, expect, it } from "vitest";
import { applyTheme, nextTheme, parseTheme, resolveTheme, themeInitScript, THEME_STORAGE_KEY } from "./theme";

describe("parseTheme", () => {
  it("garde clair et sombre, tout le reste devient automatique", () => {
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
    expect(parseTheme("auto")).toBe("auto");
    expect(parseTheme(null)).toBe("auto");
    expect(parseTheme(undefined)).toBe("auto");
    expect(parseTheme("violet")).toBe("auto");
  });
});

describe("resolveTheme", () => {
  it("suit l'appareil en mode automatique et le choix sinon", () => {
    expect(resolveTheme("auto", true)).toBe("dark");
    expect(resolveTheme("auto", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});

describe("nextTheme", () => {
  it("fait le tour clair, sombre, automatique", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("auto");
    expect(nextTheme("auto")).toBe("light");
  });
});

describe("applyTheme", () => {
  it("pose le choix, le thème effectif et color-scheme sur l'élément racine", () => {
    const root = document.createElement("html");

    expect(applyTheme(root, "auto", true)).toBe("dark");
    expect(root.dataset.themePref).toBe("auto");
    expect(root.dataset.theme).toBe("dark");
    expect(root.style.colorScheme).toBe("dark");

    applyTheme(root, "light", true);
    expect(root.dataset.theme).toBe("light");
    expect(root.style.colorScheme).toBe("light");
  });
});

describe("themeInitScript", () => {
  function run(stored: string | null, systemDark: boolean, storageThrows = false) {
    const root = document.createElement("html");
    const localStorage = {
      getItem: (key: string) => {
        if (storageThrows) throw new Error("denied");
        expect(key).toBe(THEME_STORAGE_KEY);
        return stored;
      },
    };
    const window = { matchMedia: () => ({ matches: systemDark }) };

    new Function("localStorage", "window", "document", themeInitScript())(localStorage, window, { documentElement: root });

    return root;
  }

  it("applique le choix enregistré avant l'affichage", () => {
    expect(run("dark", false).dataset.theme).toBe("dark");
    expect(run("light", true).dataset.theme).toBe("light");
  });

  it("suit l'appareil sans choix enregistré", () => {
    const root = run(null, true);

    expect(root.dataset.themePref).toBe("auto");
    expect(root.dataset.theme).toBe("dark");
    expect(root.style.colorScheme).toBe("dark");
    expect(run(null, false).dataset.theme).toBe("light");
  });

  it("ne casse pas quand le stockage est inaccessible", () => {
    expect(() => run(null, true, true)).not.toThrow();
  });

  it("donne le même résultat que la logique TypeScript", () => {
    for (const stored of ["light", "dark", "auto", "x", null]) {
      for (const systemDark of [true, false]) {
        const fromScript = run(stored, systemDark);
        const reference = document.createElement("html");
        applyTheme(reference, parseTheme(stored), systemDark);

        expect(fromScript.dataset.theme).toBe(reference.dataset.theme);
        expect(fromScript.dataset.themePref).toBe(reference.dataset.themePref);
      }
    }
  });
});
