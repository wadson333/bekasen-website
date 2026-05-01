import { useTranslations } from "next-intl";
import Link from "next/link";
import { LayoutDashboard, FolderKanban, Code2, Settings, LogOut } from "lucide-react";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("portal");

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Portal Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/" className="text-xl font-bold font-[family-name:var(--font-syne)]">
            BEKASEN <span className="text-zinc-400 font-normal">PORTAL</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/portal" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-medium">
            <LayoutDashboard size={20} />
            {t("nav.dashboard")}
          </Link>
          <Link href="/portal/projects" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <FolderKanban size={20} />
            {t("nav.projects")}
          </Link>
          <Link href="/portal/code-reviews" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <Code2 size={20} />
            {t("nav.codeReviews")}
          </Link>
          <Link href="/portal/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <Settings size={20} />
            {t("nav.settings")}
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600">
            <LogOut size={20} />
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
