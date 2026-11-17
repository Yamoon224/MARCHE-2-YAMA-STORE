import Link from "next/link";

type Props = { id: string; title: string; subtitle?: string; href?: string; linkLabel?: string; onDark?: boolean };

/** En-tête de section de la maquette : filet rouge, titre, sous-titre et lien « voir tout ». */
export function SectionHead({ id, title, subtitle, href, linkLabel = "Voir tout →", onDark = false }: Props) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className={`h-7 w-1.5 rounded-lg ${onDark ? "bg-white" : "bg-brand-red"}`} />
          <h2 id={id} className="text-[19px] font-extrabold sm:text-[23px]">
            {title}
          </h2>
        </div>
        {subtitle && <p className={`mt-1 text-[11px] sm:text-xs ${onDark ? "text-[#ffe0e3]" : "text-muted"}`}>{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className={`whitespace-nowrap text-[11px] font-extrabold sm:text-[13px] ${onDark ? "rounded-full bg-white px-3.5 py-2 text-brand-red" : "text-brand-green hover:underline"}`}
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
