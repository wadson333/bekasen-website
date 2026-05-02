"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/cms/ui/button";
import { Input } from "@/components/cms/ui/input";
import { Label } from "@/components/cms/ui/label";
import type { ClientProject } from "@/drizzle/schema";

type Props = { project: ClientProject };
type Status = "not_started" | "in_progress" | "review" | "completed";

export default function ClientProjectEditor({ project }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [projectTitle, setProjectTitle] = useState(project.projectTitle);
  const [clientName, setClientName] = useState(project.clientName);
  const [clientEmail, setClientEmail] = useState(project.clientEmail ?? "");
  const [status, setStatus] = useState<Status>(project.status as Status);
  const [progressPct, setProgressPct] = useState(project.progressPct);
  const [estimatedEndDate, setEstimatedEndDate] = useState(project.estimatedEndDate ?? "");
  const [notesForClient, setNotesForClient] = useState(project.notesForClient ?? "");
  const [internalNotes, setInternalNotes] = useState(project.internalNotes ?? "");

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await fetch(`/api/clients/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle: projectTitle.trim(),
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim() || "",
          status,
          progressPct,
          estimatedEndDate: estimatedEndDate || "",
          notesForClient: notesForClient.trim() || undefined,
          internalNotes: internalNotes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Update failed");
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-bg-secondary p-6 space-y-5">
      <h2 className="font-(family-name:--font-syne) text-xl font-bold text-text-primary">
        Project details
      </h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Project title</Label>
          <Input id="title" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client">Client name</Label>
          <Input id="client" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Client email</Label>
          <Input
            id="email"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="(optional, for notifications)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end">Estimated end date</Label>
          <Input
            id="end"
            type="date"
            value={estimatedEndDate}
            onChange={(e) => setEstimatedEndDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="flex h-10 w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <option value="not_started">Not started</option>
            <option value="in_progress">In progress</option>
            <option value="review">Under review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="progress">Progress: {progressPct}%</Label>
          <input
            id="progress"
            type="range"
            min={0}
            max={100}
            step={5}
            value={progressPct}
            onChange={(e) => setProgressPct(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes-client">Notes visible to the client (shown on the public dashboard)</Label>
        <textarea
          id="notes-client"
          value={notesForClient}
          onChange={(e) => setNotesForClient(e.target.value)}
          rows={3}
          maxLength={2000}
          className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus-visible:ring-2 focus-visible:ring-purple-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes-internal">Internal notes (founder-only, never shown to the client)</Label>
        <textarea
          id="notes-internal"
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          rows={3}
          maxLength={2000}
          className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus-visible:ring-2 focus-visible:ring-purple-500"
        />
      </div>

      {error ? (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
          Saved.
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="inline-flex items-center gap-2">
        <Save className="h-4 w-4" /> {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
