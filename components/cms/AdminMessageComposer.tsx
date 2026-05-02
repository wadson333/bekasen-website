"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/cms/ui/button";
import type { ProjectMessage } from "@/drizzle/schema";

export default function AdminMessageComposer({
  projectId,
  messages,
}: {
  projectId: string;
  messages: ProjectMessage[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/clients/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: draft.trim() }),
      });
      if (!res.ok) {
        setError("Could not send. Try again.");
        return;
      }
      setDraft("");
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-border bg-bg-secondary p-6">
      <h2 className="font-(family-name:--font-syne) text-xl font-bold text-text-primary">
        Messages
      </h2>

      <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No messages yet. Send the first one — your client will see it on their dashboard.
          </p>
        ) : (
          messages.map((m) => {
            const isAdmin = m.senderType === "admin";
            return (
              <div key={m.id} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    isAdmin
                      ? "bg-bg-primary text-text-primary border border-border"
                      : "bg-purple-600 text-white"
                  }`}
                >
                  <p className="text-xs opacity-70">
                    {isAdmin ? "You (admin)" : "Client"}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm">{m.message}</p>
                  <p className="mt-1 text-[10px] opacity-60">
                    {new Date(m.createdAt).toLocaleString()}
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
          placeholder="Write a message to the client…"
          rows={2}
          maxLength={2000}
          className="flex-1 rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus-visible:ring-2 focus-visible:ring-purple-500"
        />
        <Button type="submit" disabled={pending || !draft.trim()} className="sm:w-32">
          {pending ? "Sending…" : (
            <span className="inline-flex items-center gap-2">
              Send <Send className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
    </section>
  );
}
