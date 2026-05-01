"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Send } from "lucide-react";
import type { ProjectMessage } from "@/drizzle/schema";
import { Button } from "@/components/cms/ui/button";

const COPY: Record<string, {
  header: string;
  empty: string;
  placeholder: string;
  send: string;
  sending: string;
  errored: string;
  you: string;
  team: string;
}> = {
  en: {
    header: "Messages",
    empty: "No messages yet — feel free to write to your team below.",
    placeholder: "Write a message to your team…",
    send: "Send",
    sending: "Sending…",
    errored: "Could not send. Try again.",
    you: "You",
    team: "Bekasen team",
  },
  fr: {
    header: "Messages",
    empty: "Aucun message pour l'instant — n'hésitez pas à écrire à l'équipe.",
    placeholder: "Écrivez un message à votre équipe…",
    send: "Envoyer",
    sending: "Envoi…",
    errored: "Impossible d'envoyer. Réessayez.",
    you: "Vous",
    team: "Équipe Bekasen",
  },
  ht: {
    header: "Mesaj",
    empty: "Pa gen mesaj — ekri ekip ou la anba a.",
    placeholder: "Ekri yon mesaj pou ekip ou…",
    send: "Voye",
    sending: "Ap voye…",
    errored: "Pa kab voye. Eseye ankò.",
    you: "Ou",
    team: "Ekip Bekasen",
  },
  es: {
    header: "Mensajes",
    empty: "Aún no hay mensajes — escribe a tu equipo abajo.",
    placeholder: "Escribe un mensaje a tu equipo…",
    send: "Enviar",
    sending: "Enviando…",
    errored: "No se pudo enviar. Inténtalo de nuevo.",
    you: "Tú",
    team: "Equipo Bekasen",
  },
};

type Props = {
  token: string;
  initialMessages: ProjectMessage[];
  locale: string;
};

export default function ClientMessageThread({ token, initialMessages, locale }: Props) {
  const safeLocale = ["en", "fr", "ht", "es"].includes(locale) ? locale : "en";
  const t = COPY[safeLocale] ?? COPY.en;

  const [messages, setMessages] = useState<ProjectMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/client-view/${encodeURIComponent(token)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: draft.trim() }),
      });
      if (!res.ok) {
        setError(t.errored);
        return;
      }
      const { message } = (await res.json()) as { message: ProjectMessage };
      setMessages((prev) => [...prev, message]);
      setDraft("");
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-bg-secondary p-6">
      <h2 className="font-(family-name:--font-syne) text-xl font-bold text-text-primary">
        {t.header}
      </h2>

      <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="text-sm text-text-secondary">{t.empty}</p>
        ) : (
          messages.map((m) => {
            const isClient = m.senderType === "client";
            return (
              <div
                key={m.id}
                className={`flex ${isClient ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    isClient
                      ? "bg-purple-600 text-white"
                      : "bg-bg-primary text-text-primary border border-border"
                  }`}
                >
                  <p className="text-xs opacity-70">{isClient ? t.you : t.team}</p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm">
                    {m.message}
                  </p>
                  <p className="mt-1 text-[10px] opacity-60">
                    {new Date(m.createdAt).toLocaleString(safeLocale)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {error ? (
        <p className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}

      <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t.placeholder}
          rows={2}
          maxLength={2000}
          className="flex-1 rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        />
        <Button type="submit" disabled={pending || !draft.trim()} className="sm:w-32">
          {pending ? t.sending : (
            <span className="inline-flex items-center gap-2">
              {t.send} <Send className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
    </section>
  );
}
