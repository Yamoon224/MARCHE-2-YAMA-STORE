import Link from "next/link";

type Props = { page: number; lastPage: number; basePath: string; params?: Record<string, string> };

/** Numéros à afficher : première, dernière et deux voisines de la page courante, avec des « … » entre les trous. */
export function pageWindow(page: number, lastPage: number): (number | "…")[] {
  const wanted = new Set([1, lastPage, page - 2, page - 1, page, page + 1, page + 2].filter((n) => n >= 1 && n <= lastPage));
  const sorted = [...wanted].sort((a, b) => a - b);
  const out: (number | "…")[] = [];

  sorted.forEach((n, index) => {
    if (index > 0 && n - sorted[index - 1] > 1) out.push("…");
    out.push(n);
  });

  return out;
}

export function Pagination({ page, lastPage, basePath, params = {} }: Props) {
  if (lastPage <= 1) return null;

  const href = (n: number) => {
    const query = new URLSearchParams(params);
    if (n > 1) query.set("page", String(n));
    const qs = query.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const item = "grid h-10 min-w-10 place-items-center rounded-full border px-3 text-sm font-bold";

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={`${item} border-line bg-white hover:border-brand-green`}>
          ‹ Précédent
        </Link>
      ) : (
        <span aria-disabled="true" className={`${item} border-line bg-white opacity-40`}>‹ Précédent</span>
      )}

      {pageWindow(page, lastPage).map((n, index) =>
        n === "…" ? (
          <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-muted">…</span>
        ) : (
          <Link
            key={n}
            href={href(n)}
            aria-label={`Page ${n}`}
            aria-current={n === page ? "page" : undefined}
            className={`${item} ${n === page ? "border-brand-green bg-brand-green text-white" : "border-line bg-white hover:border-brand-green"}`}
          >
            {n}
          </Link>
        ),
      )}

      {page < lastPage ? (
        <Link href={href(page + 1)} rel="next" className={`${item} border-line bg-white hover:border-brand-green`}>
          Suivant ›
        </Link>
      ) : (
        <span aria-disabled="true" className={`${item} border-line bg-white opacity-40`}>Suivant ›</span>
      )}
    </nav>
  );
}