export type Issue = "missing" | "damaged" | "expired" | "non_conforming";
export type SaleUnit = "piece" | "kg" | "l";

export const ISSUE_LABEL: Record<Issue, string> = {
  missing: "Article manquant",
  damaged: "Article abîmé",
  expired: "Article périmé",
  non_conforming: "Article non conforme",
};

export const ISSUES = Object.keys(ISSUE_LABEL) as Issue[];

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Un article manquant ne se photographie pas ; tout autre problème exige une preuve. */
export function issueNeedsPhoto(issue: Issue): boolean {
  return issue !== "missing";
}

export type DraftLine = {
  orderLineId: number;
  name: string;
  saleUnit: SaleUnit;
  /** Quantité reçue : pièces, grammes ou millilitres. */
  received: number;
  selected: boolean;
  issue: Issue;
  /** Saisie brute (entier dans l'unité de base). */
  quantity: string;
  note: string;
};

export type PhotoLike = { name: string; type: string; size: number };

export function unitSuffix(unit: SaleUnit): string {
  return unit === "piece" ? "pièce(s)" : unit === "kg" ? "g" : "ml";
}

/** Entier ≥ 1 dans l'unité de base ; `null` si invalide (virgule, texte, zéro, négatif). */
export function parseQuantity(input: string): number | null {
  const text = input.trim();
  if (!/^\d{1,7}$/.test(text)) return null;

  const value = Number(text);

  return value >= 1 ? value : null;
}

export function validatePhotos(photos: PhotoLike[]): string | null {
  if (photos.length > MAX_PHOTOS) return `Vous pouvez joindre ${MAX_PHOTOS} photos au maximum.`;

  for (const photo of photos) {
    if (!ALLOWED_PHOTO_TYPES.includes(photo.type)) return `« ${photo.name} » n'est pas une image JPEG, PNG ou WebP.`;
    if (photo.size > MAX_PHOTO_BYTES) return `« ${photo.name} » dépasse 4 Mo.`;
  }

  return null;
}

/** Premier problème du brouillon, ou `null` s'il peut être envoyé. Le serveur reste l'autorité. */
export function validateDraft(lines: DraftLine[], photos: PhotoLike[]): string | null {
  const selected = lines.filter((l) => l.selected);
  if (selected.length === 0) return "Sélectionnez au moins un article concerné.";

  for (const line of selected) {
    const quantity = parseQuantity(line.quantity);
    if (quantity === null) return `Indiquez une quantité entière pour « ${line.name} ».`;
    if (quantity > line.received) return `Vous n'avez reçu que ${line.received} ${unitSuffix(line.saleUnit)} de « ${line.name} ».`;
  }

  if (selected.some((l) => issueNeedsPhoto(l.issue)) && photos.length === 0) {
    return "Ajoutez au moins une photo : elle est obligatoire pour un article abîmé, périmé ou non conforme.";
  }

  return validatePhotos(photos);
}

/** Corps multipart attendu par l'API : `items[i][champ]`, `photos[]`, `description`. */
export function buildClaimFormData(lines: DraftLine[], photos: File[], description: string): FormData {
  const form = new FormData();

  lines
    .filter((l) => l.selected)
    .forEach((line, index) => {
      form.append(`items[${index}][order_line_id]`, String(line.orderLineId));
      form.append(`items[${index}][issue]`, line.issue);
      form.append(`items[${index}][quantity]`, String(parseQuantity(line.quantity)));
      if (line.note.trim() !== "") form.append(`items[${index}][note]`, line.note.trim());
    });

  photos.forEach((photo) => form.append("photos[]", photo));
  if (description.trim() !== "") form.append("description", description.trim());

  return form;
}

export const CLAIM_STATUS_LABEL: Record<string, string> = {
  open: "En cours d'examen",
  accepted: "Acceptée",
  rejected: "Refusée",
};

export const RESOLUTION_LABEL: Record<string, string> = {
  refund: "Remboursement sur votre moyen de paiement",
  redelivery: "Nouvel envoi des articles concernés",
};
