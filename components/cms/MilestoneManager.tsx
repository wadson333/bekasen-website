"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/cms/ui/button";
import { Input } from "@/components/cms/ui/input";
import { Label } from "@/components/cms/ui/label";
import type { ProjectMilestone } from "@/drizzle/schema";

type Status = "pending" | "in_progress" | "completed";

const STATUS_ICON = { pending: Clock, in_progress: Loader2, completed: Check } as const;
const STATUS_TONE: Record<Status, string> = {
  pending: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  in_progress: "border-sky-500/30 bg-sky-500/15 text-sky-300",
  completed: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
};

export default function MilestoneManager({
  projectId,
  milestones,
}: {
  projectId: string;
  milestones: ProjectMilestone[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  function reset() {
    setTitle("");
    setDescription("");
    setDueDate("");
  }

  function add(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch(`/api/clients/${projectId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate || "",
          displayOrder: milestones.length,
        }),
      });
      if (res.ok) {
        reset();
        setShowForm(false);
        router.refresh();
      }
    });
  }

  function setStatus(milestoneId: string, next: Status) {
    startTransition(async () => {
      await fetch(`/api/clients/${projectId}/milestones/${milestoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    });
  }

  function remove(milestoneId: string) {
    if (!confirm("Delete this milestone?")) return;
    startTransition(async () => {
      await fetch(`/api/clients/${projectId}/milestones/${milestoneId}`, {
        method: "DELETE",
      });
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-border bg-bg-secondary p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-(family-name:--font-syne) text-xl font-bold text-text-primary">
          Milestones
        </h2>
        {!showForm ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add milestone
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <form onSubmit={add} className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-3">
            <Label htmlFor="ms-title">Title *</Label>
            <Input
              id="ms-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Homepage design approved"
              required
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="ms-desc">Description</Label>
            <Input
              id="ms-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="(optional)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ms-due">Due date</Label>
            <Input id="ms-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="lg:col-span-3 flex items-center gap-2">
            <Button type="submit" size="sm" disabled={pending || !title.trim()}>
              {pending ? "Adding…" : "Add"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                reset();
                setShowForm(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {milestones.length === 0 ? (
        <p className="mt-4 text-sm text-text-secondary">
          No milestones yet. Add the first one to start showing progress to your client.
        </p>
      ) : (
        <ol className="mt-4 space-y-3">
          {milestones.map((m) => {
            const status = m.status as Status;
            const Icon = STATUS_ICON[status] ?? Clock;
            const tone = STATUS_TONE[status] ?? STATUS_TONE.pending;
            return (
              <li
                key={m.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-bg-card p-3"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${tone}`}
                >
                  <Icon className={`h-4 w-4 ${status === "in_progress" ? "animate-spin" : ""}`} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{m.title}</p>
                  {m.description ? (
                    <p className="text-xs text-text-secondary mt-0.5">{m.description}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    {m.dueDate ? (
                      <span className="text-text-secondary">Due {m.dueDate}</span>
                    ) : null}
                    {m.completedAt ? (
                      <span className="text-emerald-300">
                        Done {new Date(m.completedAt).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <select
                    value={status}
                    onChange={(e) => setStatus(m.id, e.target.value as Status)}
                    disabled={pending}
                    className="h-8 rounded-md border border-border bg-bg-primary px-2 text-xs text-text-primary focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => remove(m.id)}
                    disabled={pending}
                    className="rounded-md p-1.5 text-text-secondary hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                    aria-label="Delete milestone"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
