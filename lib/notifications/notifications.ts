/** Pastille du menu : jamais un nombre à rallonge, rien du tout s'il n'y a rien de non lu. */
export function badgeLabel(unread: number): string | null {
  if (!Number.isFinite(unread) || unread <= 0) return null;

  return unread > 9 ? "9+" : String(Math.floor(unread));
}

/** Date lisible en français (« 14 nov. à 09:30 ») ; texte vide si la date est illisible. */
export function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const day = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" }).format(date);
  const time = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(date);

  return `${day} à ${time}`;
}
