import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Allow all in production. Previews and local builds disallow all so they are never indexed. */
export default function robots(): MetadataRoute.Robots {
  const production = process.env.VERCEL_ENV === "production";
  return {
    rules: production ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
