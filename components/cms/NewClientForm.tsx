"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/cms/ui/button";
import { Input } from "@/components/cms/ui/input";
import { Label } from "@/components/cms/ui/label";

type Locale = "fr" | "en" | "ht" | "es";

export default function NewClientForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [locale, setLocale] = useState<Locale>("fr");

  function reset() {
    setClientName("");
    setClientEmail("");
    setProjectTitle("");
    setLocale("fr");
    setError(null);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim() || undefined,
          projectTitle: projectTitle.trim(),
          locale,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Could not create the project. Try again.");
        return;
      }
      reset();
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2">
        <Plus className="h-4 w-4" /> New project
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-purple-500/30 bg-bg-secondary p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-(family-name:--font-syne) text-lg font-bold text-text-primary">
          Create a new client project
        </h3>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="rounded-md p-1 text-text-secondary hover:bg-bg-card"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clientName">Client name *</Label>
          <Input
            id="clientName"
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Acme Inc. / Marie Joseph"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientEmail">Client email (optional, for notifications)</Label>
          <Input
            id="clientEmail"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="contact@client.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="projectTitle">Project title *</Label>
          <Input
            id="projectTitle"
            type="text"
            required
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="E-commerce website redesign"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="locale">Dashboard language *</Label>
          <select
            id="locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            required
            className="flex h-10 w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ht">Kreyòl</option>
            <option value="es">Español</option>
          </select>
        </div>

        {error ? (
          <p className="lg:col-span-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        ) : null}

        <div className="lg:col-span-2 flex items-center gap-2">
          <Button type="submit" disabled={pending || !clientName.trim() || !projectTitle.trim()}>
            {pending ? "Creating…" : "Create + share link"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              reset();
              setOpen(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
