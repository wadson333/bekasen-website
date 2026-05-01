import { useTranslations } from "next-intl";
import { FolderKanban, CheckCircle2, Clock, Code2 } from "lucide-react";

export default function PortalDashboard() {
  const t = useTranslations("portal");

  // Mock data for demonstration
  const projects = [
    {
      id: "1",
      name: "E-commerce Platform",
      status: "development",
      progress: 65,
      lastUpdate: "2 days ago",
    },
    {
      id: "2",
      name: "Corporate Website",
      status: "design",
      progress: 30,
      lastUpdate: "5 hours ago",
    },
  ];

  const reviews = [
    {
      id: "r1",
      project: "E-commerce Platform",
      title: "Checkout Flow Optimization",
      status: "approved",
      date: "2026-04-28",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">
          {t("dashboard.greeting")} Client
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          {t("dashboard.overview")}
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
            <FolderKanban size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500">{t("dashboard.activeProjects")}</p>
            <p className="text-2xl font-bold">{projects.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Milestones Done</p>
            <p className="text-2xl font-bold">12</p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
            <Code2 size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Reviews Pending</p>
            <p className="text-2xl font-bold">2</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Projects List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FolderKanban size={20} className="text-zinc-400" />
            {t("dashboard.activeProjects")}
          </h2>
          
          {projects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{project.name}</h3>
                  <p className="text-sm text-zinc-500 flex items-center gap-1">
                    <Clock size={14} /> Updated {project.lastUpdate}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium uppercase tracking-wider">
                  {t(`projectStatus.${project.status}`)}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-500">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <button className="text-blue-600 text-sm font-semibold hover:underline">
                {t("dashboard.viewProject")} →
              </button>
            </div>
          ))}
        </div>

        {/* Sidebar / Recent Reviews */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Code2 size={20} className="text-zinc-400" />
            {t("dashboard.recentReviews")}
          </h2>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <p className="text-xs text-blue-600 font-bold mb-1">{review.project}</p>
                <h4 className="font-medium mb-1">{review.title}</h4>
                <div className="flex justify-between items-center text-xs text-zinc-500">
                  <span>{review.date}</span>
                  <span className="text-green-600 font-medium capitalize">{review.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
