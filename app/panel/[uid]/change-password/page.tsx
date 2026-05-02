"use client";

import { useState, useTransition, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/cms/ui/button";
import { Input } from "@/components/cms/ui/input";
import { Label } from "@/components/cms/ui/label";
import { extractPanelUidFromPath } from "@/lib/panel-uid";

export default function ChangePasswordPage() {
  const router = useRouter();
  const pathname = usePathname();
  const uid = extractPanelUidFromPath(pathname);
  const panelBase = uid ? `/panel/${uid}` : "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const valid =
    newPassword.length >= 12 &&
    /[a-z]/.test(newPassword) &&
    /[A-Z]/.test(newPassword) &&
    /\d/.test(newPassword) &&
    newPassword === confirm;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!valid) {
      setError("Password must be 12+ chars with upper, lower, and digit, and match.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) {
        setError("Could not change password. Sign in again.");
        return;
      }
      router.push(`${panelBase}/setup-2fa`);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-bg-secondary p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="font-(family-name:--font-syne) text-2xl font-bold text-text-primary">
            Set a new password
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Choose something only you know. 12+ characters, with upper, lower,
            and a digit.
          </p>
        </div>

        {error ? (
          <p className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        ) : null}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={pending || !valid} className="w-full">
            {pending ? "Updating…" : "Set password and continue"}
          </Button>
        </form>
      </div>
    </main>
  );
}
