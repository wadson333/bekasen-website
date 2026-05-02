"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Star, Trash2 } from "lucide-react";
import type { PortfolioProject } from "@/drizzle/schema";
import PortfolioForm from "@/components/cms/PortfolioForm";

const CATEGORY_LABEL: Record<string, string> = {
  showcase: "Showcase",
  business: "Business",
  webapp: "Web app",
  saas: "SaaS",
};

export default function PortfolioRow({ project }: { project: PortfolioProject }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!confirm(`Unpublish "${project.title.en}"? It will disappear from the public site (soft delete — restore via DB).`)) {
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/portfolio/${project.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    });
  }

  if (editing) {
    return (
      <tr>
        <td colSpan={5} className="p-4">
          <PortfolioForm mode="edit" project={project} onClose={() => setEditing(false)} />
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-bg-card/50 transition-colors">
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-2">
          {project.isFeatured ? (
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" aria-label="Featured" />
          ) : null}
          <span className="font-medium text-text-primary">{project.title.en}</span>
          {!project.isPublished ? (
            <span className="rounded-full bg-slate-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-300">
              draft
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs text-text-secondary truncate">{project.slug}</p>
      </td>
      <td className="px-4 py-3 align-top text-sm text-text-secondary">
        {CATEGORY_LABEL[project.category] ?? project.category}
      </td>
      <td className="px-4 py-3 align-top hidden md:table-cell">
        <div className="flex flex-wrap gap-1">
          {project.techStack.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full border border-border bg-bg-card px-2 py-0.5 text-[10px] text-text-secondary"
            >
              {t}
            </span>
          ))}
          {project.techStack.length > 3 ? (
            <span className="text-[10px] text-text-secondary">+{project.techStack.length - 3}</span>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-3 align-top hidden lg:table-cell text-xs text-text-secondary">
        {project.demoUrl ? (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-400 truncate block max-w-[200px]"
          >
            {project.demoUrl.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <span className="opacity-50">—</span>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md p-1.5 text-text-secondary hover:bg-purple-500/10 hover:text-purple-400"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={remove}
            className="rounded-md p-1.5 text-text-secondary hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            title="Unpublish"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
