import { Check, Loader2, Clock } from "lucide-react";
import type { ProjectMilestone } from "@/drizzle/schema";

const HEADERS: Record<string, string> = {
  en: "Project timeline",
  fr: "Calendrier du projet",
  ht: "Kalandriye pwojè",
  es: "Cronograma del proyecto",
};

const EMPTY: Record<string, string> = {
  en: "No milestones yet — your founder will set them up shortly.",
  fr: "Aucune étape pour l'instant — elles seront ajoutées sous peu.",
  ht: "Pa gen etap pou kounye a — yo pral ajoute yo byento.",
  es: "Aún no hay hitos — se añadirán pronto.",
};

const STATUS_ICON = {
  pending: Clock,
  in_progress: Loader2,
  completed: Check,
} as const;

const STATUS_TONE = {
  pending: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  in_progress: "border-sky-500/30 bg-sky-500/15 text-sky-300",
  completed: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
} as const;

const DUE_LABEL: Record<string, string> = {
  en: "Due",
  fr: "Échéance",
  ht: "Limit",
  es: "Vence",
};

const DONE_LABEL: Record<string, string> = {
  en: "Completed",
  fr: "Terminé le",
  ht: "Fini",
  es: "Completado",
};

type Props = {
  milestones: ProjectMilestone[];
  locale: string;
};

export default function MilestoneTimeline({ milestones, locale }: Props) {
  const safeLocale = ["en", "fr", "ht", "es"].includes(locale) ? locale : "en";

  return (
    <section className="rounded-2xl border border-border bg-bg-secondary p-6">
      <h2 className="font-(family-name:--font-syne) text-xl font-bold text-text-primary">
        {HEADERS[safeLocale] ?? HEADERS.en}
      </h2>

      {milestones.length === 0 ? (
        <p className="mt-4 text-sm text-text-secondary">{EMPTY[safeLocale] ?? EMPTY.en}</p>
      ) : (
        <ol className="mt-6 space-y-5">
          {milestones.map((m, idx) => {
            const status = m.status as keyof typeof STATUS_ICON;
            const Icon = STATUS_ICON[status] ?? Clock;
            const tone = STATUS_TONE[status] ?? STATUS_TONE.pending;
            const isLast = idx === milestones.length - 1;

            return (
              <li key={m.id} className="relative flex gap-4">
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[15px] top-9 h-[calc(100%+0.5rem)] w-px bg-border"
                  />
                ) : null}
                <span
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${tone}`}
                >
                  <Icon
                    className={`h-4 w-4 ${status === "in_progress" ? "animate-spin" : ""}`}
                    strokeWidth={2.5}
                  />
                </span>
                <div className="flex-1 pb-1">
                  <p className="text-sm font-semibold text-text-primary">{m.title}</p>
                  {m.description ? (
                    <p className="mt-1 text-sm text-text-secondary">{m.description}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
                    {m.dueDate ? (
                      <span>
                        {DUE_LABEL[safeLocale] ?? DUE_LABEL.en}: {m.dueDate}
                      </span>
                    ) : null}
                    {m.completedAt ? (
                      <span className="text-emerald-300">
                        {DONE_LABEL[safeLocale] ?? DONE_LABEL.en}:{" "}
                        {new Date(m.completedAt).toLocaleDateString(safeLocale)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
