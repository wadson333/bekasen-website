import { Download, ExternalLink, FileText } from "lucide-react";
import type { ProjectDeliverable } from "@/drizzle/schema";

const HEADERS: Record<string, string> = {
  en: "Deliverables",
  fr: "Livrables",
  ht: "Liv yo",
  es: "Entregables",
};

const EMPTY: Record<string, string> = {
  en: "No deliverables yet.",
  fr: "Aucun livrable pour l'instant.",
  ht: "Pa gen liv pou kounye a.",
  es: "Aún no hay entregables.",
};

type Props = {
  deliverables: ProjectDeliverable[];
  locale: string;
};

export default function DeliverableList({ deliverables, locale }: Props) {
  const safeLocale = ["en", "fr", "ht", "es"].includes(locale) ? locale : "en";

  return (
    <section className="rounded-2xl border border-border bg-bg-secondary p-6">
      <h2 className="font-(family-name:--font-syne) text-xl font-bold text-text-primary">
        {HEADERS[safeLocale] ?? HEADERS.en}
      </h2>

      {deliverables.length === 0 ? (
        <p className="mt-4 text-sm text-text-secondary">{EMPTY[safeLocale] ?? EMPTY.en}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {deliverables.map((d) => {
            const href = d.fileUrl ?? d.externalUrl ?? "#";
            const isExternal = !d.fileUrl && !!d.externalUrl;
            return (
              <li key={d.id}>
                <a
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-bg-primary p-4 transition-colors hover:border-purple-500/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/15 text-purple-300">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{d.label}</p>
                      <p className="text-xs text-text-secondary">
                        {new Date(d.deliveredAt).toLocaleDateString(safeLocale)}
                      </p>
                    </div>
                  </div>
                  <span className="text-purple-300">
                    {isExternal ? (
                      <ExternalLink className="h-4 w-4" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
