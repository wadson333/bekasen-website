/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://bekasen.com",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ["/api/*", "/portal/*", "/studio/*"],
  alternateRefs: [
    { href: "https://bekasen.com/fr", hreflang: "fr" },
    { href: "https://bekasen.com/en", hreflang: "en" },
    { href: "https://bekasen.com/ht", hreflang: "ht" },
    { href: "https://bekasen.com/es", hreflang: "es" },
  ],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/api/", "/portal/"] },
    ],
  },
  changefreq: "weekly",
  priority: 0.7,
  transform: async (config, path) => {
    let priority = config.priority;
    if (path === "/" || /^\/(fr|en|ht|es)$/.test(path)) priority = 1.0;
    else if (path.includes("/about") || path.includes("/contact")) priority = 0.8;
    return {
      loc: path,
      changefreq: config.changefreq,
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};
