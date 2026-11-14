import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./lib/security-headers";

const securityHeaders = buildSecurityHeaders({
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  vercelEnv: process.env.VERCEL_ENV,
  isDev: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
