import { statusLabel, statusTone, type StatusTone } from "@/lib/orders/status";

const TONE_CLASS: Record<StatusTone, string> = {
  negative: "bg-brand-red/10 text-brand-red",
  done: "bg-brand-green/10 text-brand-green",
  progress: "bg-black/5 text-black/80",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${TONE_CLASS[statusTone(status)]}`}>{statusLabel(status)}</span>;
}
