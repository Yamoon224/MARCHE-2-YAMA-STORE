
import { describe, expect, it } from "vitest";
import {
  applyTheme,
  nextTheme,
  parseTheme,
  resolveTheme,
  themeInitScript,
  THEME_STORAGE_KEY,
} from "./theme";

describe("parseTheme", () => {
  it("retourne toujours light quelle que soit la valeur reçue", () => {
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("light");
    expect(parseTheme("auto")).toBe("light");
    expect(parseTheme(null)).toBe("light");
    expect(parseTheme(undefined)).toBe("light");
    expect(parseTheme("violet")).toBe("light");
    expect(parseTheme("")).toBe("light");
  });
});

describe("resolveTheme", () => {
  it("retourne toujours light indépendamment du système", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("light", false)).toBe("light");
  });
});

describe("nextTheme", () => {
  it("ne permet aucun changement de thème", () => {
    expect(nextTheme("light")).toBe("light");
  });
});

describe("applyTheme", () => {
  it("force light sur l'élément racine", () => {
    const root = document.createElement("html");

    root.dataset.theme = "dark";
    root.dataset.themePref = "dark";

    expect(applyTheme(root, "light", true)).toBe("light");

    expect(root.dataset.themePref).toBe("light");
    expect(root.dataset.theme).toBe("light");
    expect(root.style.colorScheme).toBe("only light");
  });

  it("ignore systématiquement la préférence du système", () => {
    const root = document.createElement("html");

    applyTheme(root, "light", true);

    expect(root.dataset.theme).toBe("light");

    applyTheme(root, "light", false);

    expect(root.dataset.theme).toBe("light");
  });
});

describe("themeInitScript", () => {
  function run(
    stored: string | null,
    _systemDark: boolean,
    storageThrows = false
  ) {
    const root = document.createElement("html");

    const localStorage = {
      getItem: (key: string) => {
        if (storageThrows) throw new Error("denied");

        expect(key).toBe(THEME_STORAGE_KEY);
        return stored;
      },
      setItem: (key: string, value: string) => {
        if (storageThrows) throw new Error("denied");

        expect(key).toBe(THEME_STORAGE_KEY);
        expect(value).toBe("light");
      },
    };

    const window = {};

    new Function(
      "localStorage",
      "window",
      "document",
      themeInitScript()
    )(
      localStorage,
      window,
      { documentElement: root }
    );

    return root;
  }

  it("force light même si dark est enregistré", () => {
    const root = run("dark", false);

    expect(root.dataset.themePref).toBe("light");
    expect(root.dataset.theme).toBe("light");
    expect(root.style.colorScheme).toBe("only light");
  });

  it("force light même si auto est enregistré", () => {
    const root = run("auto", true);

    expect(root.dataset.theme).toBe("light");
    expect(root.dataset.themePref).toBe("light");
  });

  it("force light sans préférence enregistrée", () => {
    const root = run(null, true);

    expect(root.dataset.themePref).toBe("light");
    expect(root.dataset.theme).toBe("light");
    expect(root.style.colorScheme).toBe("only light");
  });

  it("ne casse pas quand le stockage est inaccessible", () => {
    expect(() => run(null, true, true)).not.toThrow();
  });

  it("retourne toujours light quelle que soit la préférence enregistrée", () => {
    const preferences = [
      "light",
      "dark",
      "auto",
      "violet",
      "",
      null,
    ];

    for (const stored of preferences) {
      for (const systemDark of [true, false]) {
        const root = run(stored, systemDark);

        expect(root.dataset.theme).toBe("light");
        expect(root.dataset.themePref).toBe("light");
        expect(root.style.colorScheme).toBe("only light");
      }
    }
  });
});
