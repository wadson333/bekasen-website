"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Check, Trash2, ArchiveRestore } from "lucide-react";

type Props = {
  leadId: string;
  isArchived: boolean;
  isQualified: boolean;
};

export default function LeadActions({ leadId, isArchived, isQualified }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function patch(payload: { isArchived?: boolean; isQualified?: boolean }) {
    startTransition(async () => {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) router.refresh();
    });
  }

  function remove() {
    if (!confirm("Permanently delete this lead?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1">
      {!isQualified ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => patch({ isQualified: true })}
          title="Mark as qualified"
          className="rounded-md p-1.5 text-text-secondary hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => patch({ isQualified: false })}
          title="Un-qualify"
          className="rounded-md p-1.5 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      )}

      {!isArchived ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => patch({ isArchived: true })}
          title="Archive"
          className="rounded-md p-1.5 text-text-secondary hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-50"
        >
          <Archive className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => patch({ isArchived: false })}
          title="Restore"
          className="rounded-md p-1.5 text-text-secondary hover:bg-sky-500/10 hover:text-sky-400 disabled:opacity-50"
        >
          <ArchiveRestore className="h-3.5 w-3.5" />
        </button>
      )}

      <button
        type="button"
        disabled={pending}
        onClick={remove}
        title="Delete permanently"
        className="rounded-md p-1.5 text-text-secondary hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
