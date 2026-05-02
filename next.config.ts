import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Required so the production Dockerfile can `COPY .next/standalone` and
  // ship a self-contained server with only the runtime files (~30-50MB
  // image without node_modules). Dev/Turbopack ignores this flag.
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
