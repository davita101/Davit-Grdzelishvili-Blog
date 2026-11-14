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
  // Post pages read content/posts with fs. The loader opts out of tracing (it would
  // pull in the whole project), so include the posts explicitly for any runtime
  // render, e.g. revalidation.
  outputFileTracingIncludes: {
    "/blog/**": ["./content/posts/**"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
