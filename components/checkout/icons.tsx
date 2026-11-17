type Props = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/** Icônes décoratives du tunnel de commande (le libellé reste porté par le texte). */
export function StoreIcon({ className = "h-5 w-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
      <path d="M5 12v8h14v-8" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

export function ScooterIcon({ className = "h-5 w-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="6" cy="17" r="2.5" />
      <circle cx="18" cy="17" r="2.5" />
      <path d="M8.5 17H14l2-8h-3" />
      <path d="M16 9h2.5" />
      <path d="M3 17h0.5M5 8h4" />
    </svg>
  );
}

export function CardIcon({ className = "h-5 w-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2.5" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </svg>
  );
}

export function CashIcon({ className = "h-5 w-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9.5v0.01M18 14.5v0.01" />
    </svg>
  );
}
