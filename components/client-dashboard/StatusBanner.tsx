import type { ClientStatus } from "@/lib/validation/clients";

const STATUS_LABELS: Record<ClientStatus, Record<string, string>> = {
  not_started: {
    en: "Not started",
    fr: "Pas commencé",
    ht: "Poko kòmanse",
    es: "No iniciado",
  },
  in_progress: {
    en: "In progress",
    fr: "En cours",
    ht: "Sou wout",
    es: "En curso",
  },
  review: {
    en: "Under review",
    fr: "En revue",
    ht: "Nan revizyon",
    es: "En revisión",
  },
  completed: {
    en: "Completed",
    fr: "Terminé",
    ht: "Fini",
    es: "Completado",
  },
};

const STATUS_TONES: Record<ClientStatus, string> = {
  not_started: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  in_progress: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  review: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

const PROGRESS_LABEL: Record<string, string> = {
  en: "Progress",
  fr: "Progression",
  ht: "Pwogrè",
  es: "Progreso",
};

type Props = {
  status: ClientStatus;
  progressPct: number;
  locale: string;
};

export default function StatusBanner({ status, progressPct, locale }: Props) {
  const safeLocale = (["en", "fr", "ht", "es"].includes(locale) ? locale : "en");
  const label = STATUS_LABELS[status]?.[safeLocale] ?? STATUS_LABELS[status]?.en ?? status;
  const progressLabel = PROGRESS_LABEL[safeLocale] ?? PROGRESS_LABEL.en;
  const tone = STATUS_TONES[status] ?? STATUS_TONES.not_started;

  return (
    <div className="rounded-2xl border border-border bg-bg-secondary p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold uppercase tracking-wider ${tone}`}
        >
          <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
          {label}
        </span>
        <span className="text-sm text-text-secondary">
          {progressLabel}: <span className="font-bold text-text-primary">{progressPct}%</span>
        </span>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-bg-primary">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, progressPct))}%` }}
        />
      </div>
    </div>
  );
}
