import { useTranslations } from "next-intl";
import { FolderKanban, ExternalLink, Calendar, Search } from "lucide-react";

export default function ProjectsPage() {
  const t = useTranslations("portal.projects");

  // Mock data
  const projects = [
    {
      id: "1",
      name: "E-commerce Platform",
      status: "development",
      client: "Lakay Market",
      startDate: "2026-03-15",
      description: "A full-scale e-commerce platform with MonCash integration.",
    },
    {
      id: "2",
      name: "Corporate Website",
      status: "design",
      client: "Horizon Hôtel",
      startDate: "2026-04-01",
      description: "Premium hotel management system and showcase site.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{t("subtitle")}</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder={t("searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col md:flex-row gap-6">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
              <FolderKanban size={32} />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">{project.name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider">
                  {project.client}
                </span>
                <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium uppercase tracking-wider ml-auto">
                  {project.status}
                </span>
              </div>
              
              <p className="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                {project.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} />
                  Started {project.startDate}
                </div>
                <button className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline">
                  <ExternalLink size={16} />
                  View Project Portal
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
