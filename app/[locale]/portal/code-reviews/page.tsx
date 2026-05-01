import { useTranslations } from "next-intl";
import { Code2, CheckCircle2, AlertCircle, ChevronRight, GitBranch } from "lucide-react";

export default function CodeReviewsPage() {
  const t = useTranslations("portal.codeReviews");

  // Mock data
  const reviews = [
    {
      id: "r1",
      project: "E-commerce Platform",
      title: "Checkout Flow Optimization",
      status: "approved",
      date: "2026-04-28",
      description: "Review of the new MonCash payment flow and state management.",
      link: "https://github.com/bekasen/ecommerce/pull/42",
    },
    {
      id: "r2",
      project: "E-commerce Platform",
      title: "Product Search Implementation",
      status: "changes_requested",
      date: "2026-04-25",
      description: "Initial feedback on the Algolia integration and UI components.",
      link: "https://github.com/bekasen/ecommerce/pull/40",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 size={20} className="text-green-600" />;
      case "changes_requested":
        return <AlertCircle size={20} className="text-amber-600" />;
      default:
        return <Code2 size={20} className="text-zinc-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-50 dark:bg-green-900/20";
      case "changes_requested":
        return "bg-amber-50 dark:bg-amber-900/20";
      default:
        return "bg-zinc-50 dark:bg-zinc-900/20";
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-zinc-500 dark:text-zinc-400">{t("subtitle")}</p>
      </header>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div 
            key={review.id} 
            className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getStatusBg(review.status)}`}>
                {getStatusIcon(review.status)}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-xl font-bold">{review.title}</h3>
                    <p className="text-sm text-blue-600 font-medium">{review.project}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-500">{review.date}</p>
                    <span className={`text-xs font-bold uppercase tracking-widest ${
                      review.status === "approved" ? "text-green-600" : "text-amber-600"
                    }`}>
                      {t(`status.${review.status}`)}
                    </span>
                  </div>
                </div>
                
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  {review.description}
                </p>

                <div className="flex items-center gap-4">
                  <a 
                    href={review.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <GitBranch size={18} />
                    View on GitHub
                  </a>
                  <button className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    Review Details <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
