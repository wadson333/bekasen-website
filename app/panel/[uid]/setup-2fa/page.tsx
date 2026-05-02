"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/cms/ui/button";
import { Input } from "@/components/cms/ui/input";
import { Label } from "@/components/cms/ui/label";
import { extractPanelUidFromPath } from "@/lib/panel-uid";

type SetupResp = { qrDataUrl: string; otpAuthUrl: string; secret: string };

export default function Setup2FAPage() {
  const router = useRouter();
  const pathname = usePathname();
  const uid = extractPanelUidFromPath(pathname);
  const panelBase = uid ? `/panel/${uid}` : "";

  const [setup, setSetup] = useState<SetupResp | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const res = await fetch("/api/auth/setup-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        setError("Could not start 2FA setup. Try signing in again.");
        setBootstrapping(false);
        return;
      }
      const data = (await res.json()) as SetupResp;
      if (!cancelled) {
        setSetup(data);
        setBootstrapping(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/setup-2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        setError("Code incorrect. Try again.");
        return;
      }
      router.push(`${panelBase}/dashboard`);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-bg-secondary p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="font-(family-name:--font-syne) text-2xl font-bold text-text-primary">
            Set up two-factor auth
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Scan the QR code with Google Authenticator, Authy, or 1Password,
            then enter the 6-digit code to confirm.
          </p>
        </div>

        {error ? (
          <p className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        ) : null}

        {bootstrapping ? (
          <p className="text-center text-sm text-text-secondary">Generating secret…</p>
        ) : !setup ? (
          <p className="text-center text-sm text-red-400">Setup failed. Reload to retry.</p>
        ) : (
          <>
            <div className="mb-6 flex flex-col items-center gap-4">
              <div className="rounded-xl bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={setup.qrDataUrl} width={240} height={240} alt="2FA QR code" />
              </div>
              <details className="w-full text-xs text-text-secondary">
                <summary className="cursor-pointer">Or enter the secret manually</summary>
                <code className="mt-2 block break-all rounded-md border border-border bg-bg-primary p-2 font-mono text-text-primary">
                  {setup.secret}
                </code>
              </details>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">6-digit code from your app</Label>
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
                {pending ? "Verifying…" : "Confirm and continue"}
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
