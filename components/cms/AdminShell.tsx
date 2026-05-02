"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Inbox,
  Briefcase,
  Tag,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { extractPanelUidFromPath } from "@/lib/panel-uid";

type NavItem = {
  label: string;
  href: string;
  Icon: typeof LayoutDashboard;
  status?: "soon" | "ready";
};

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const uid = extractPanelUidFromPath(pathname) ?? "";
  const base = uid ? `/panel/${uid}` : "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const nav: NavItem[] = [
    { label: "Dashboard", href: `${base}/dashboard`, Icon: LayoutDashboard, status: "ready" },
    { label: "Clients", href: `${base}/clients`, Icon: FolderKanban, status: "ready" },
    { label: "Leads", href: `${base}/leads`, Icon: Inbox, status: "ready" },
    { label: "Portfolio", href: `${base}/portfolio`, Icon: Briefcase, status: "soon" },
    { label: "Pricing", href: `${base}/pricing`, Icon: Tag, status: "soon" },
    { label: "Blog", href: `${base}/blog`, Icon: FileText, status: "soon" },
    { label: "Content", href: `${base}/content`, Icon: Settings, status: "soon" },
  ];

  function handleLogout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push(`${base}/login`);
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-bg-secondary">
        <div className="px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-400">
            Bekasen Panel
          </p>
          <p className="mt-1 text-sm text-text-secondary truncate">{email}</p>
        </div>

        <nav className="flex-1 px-3">
          <ul className="space-y-1">
            {nav.map(({ label, href, Icon, status }) => {
              const isActive = pathname?.startsWith(href);
              const isSoon = status === "soon";
              return (
                <li key={href}>
                  {isSoon ? (
                    <span
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                        "text-text-secondary/50 cursor-not-allowed",
                      )}
                      title="Coming soon"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{label}</span>
                      <span className="ml-auto rounded-full bg-text-secondary/15 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                        soon
                      </span>
                    </span>
                  ) : (
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-purple-600 text-white"
                          : "text-text-secondary hover:bg-bg-card hover:text-text-primary",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={pending}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              "text-text-secondary hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50",
            )}
          >
            <LogOut className="h-4 w-4" />
            {pending ? "Logging out…" : "Log out"}
          </button>
        </div>
      </aside>

      {/* Mobile topbar + drawer */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-bg-secondary px-4 py-3 lg:hidden">
          <span className="font-(family-name:--font-syne) text-lg font-bold text-text-primary">
            Bekasen Panel
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="rounded-md p-2 text-text-secondary hover:bg-bg-card"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {mobileOpen ? (
          <nav className="border-b border-border bg-bg-secondary px-3 py-3 lg:hidden">
            <ul className="space-y-1">
              {nav.map(({ label, href, Icon, status }) => {
                const isActive = pathname?.startsWith(href);
                const isSoon = status === "soon";
                return (
                  <li key={href}>
                    {isSoon ? (
                      <span className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-text-secondary/50">
                        <Icon className="h-4 w-4" />
                        {label}
                        <span className="ml-auto text-[10px] uppercase">soon</span>
                      </span>
                    ) : (
                      <Link
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                          isActive
                            ? "bg-purple-600 text-white"
                            : "text-text-secondary hover:bg-bg-card",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Link>
                    )}
                  </li>
                );
              })}
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={pending}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {pending ? "Logging out…" : "Log out"}
                </button>
              </li>
            </ul>
          </nav>
        ) : null}

        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
