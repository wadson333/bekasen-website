"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
  value: string;
  label?: string;
  className?: string;
};

export default function CopyButton({ value, label, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-card px-2 py-1 text-xs text-text-secondary hover:border-purple-500/40 hover:text-text-primary transition-colors ${className}`}
      aria-label={copied ? "Copied" : `Copy ${label ?? "value"}`}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-400" /> Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" /> {label ?? "Copy"}
        </>
      )}
    </button>
  );
}
