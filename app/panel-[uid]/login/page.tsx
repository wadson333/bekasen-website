"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/cms/ui/button";
import { Input } from "@/components/cms/ui/input";
import { Label } from "@/components/cms/ui/label";

type Step = "credentials" | "2fa";
type LoginNext = "change_password" | "2fa" | "setup_2fa" | "dashboard";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams<{ uid: string }>();
  const search = useSearchParams();
  const expired = search.get("expired") === "1";
  const fromPath = search.get("from") ?? null;

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const panelBase = `/panel-${params.uid}`;

  function nextRoute(next: LoginNext): string {
    if (next === "change_password") return `${panelBase}/change-password`;
    if (next === "setup_2fa") return `${panelBase}/setup-2fa`;
    return fromPath && fromPath.startsWith(panelBase) ? fromPath : `${panelBase}/dashboard`;
  }

  async function submitCredentials(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError("Invalid email or password.");
        return;
      }
      const data = (await res.json()) as { next: LoginNext };
      if (data.next === "2fa") {
        setStep("2fa");
        return;
      }
      router.push(nextRoute(data.next));
    });
  }

  async function submitTotp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error === "invalid_code" ? "Code incorrect. Try again." : "Verification failed.");
        return;
      }
      const data = (await res.json()) as { next: LoginNext };
      router.push(nextRoute(data.next));
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-bg-secondary p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="font-(family-name:--font-syne) text-3xl font-bold text-text-primary">
            Bekasen Panel
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {step === "credentials" ? "Sign in to manage your site." : "Enter your 2FA code."}
          </p>
        </div>

        {expired && step === "credentials" ? (
          <p className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            Your session expired. Please sign in again.
          </p>
        ) : null}
        {error ? (
          <p className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        ) : null}

        {step === "credentials" ? (
          <form onSubmit={submitCredentials} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@bekasen.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        ) : (
          <form onSubmit={submitTotp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">6-digit code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <Button type="submit" disabled={pending || code.length !== 6} className="w-full">
              {pending ? "Verifying…" : "Verify"}
            </Button>
            <button
              type="button"
              className="w-full text-xs text-text-secondary hover:text-text-primary"
              onClick={() => {
                setStep("credentials");
                setCode("");
                setError(null);
              }}
            >
              ← Back to email + password
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
