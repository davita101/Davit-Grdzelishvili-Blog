import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/content/posts";
import { SITE_URL } from "@/lib/site";

const STATIC_PATHS = ["", "/blog", "/projects", "/about"];

/** Static pages, every visible post and every tag page. The loader hides drafts in production. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...getAllPosts().map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updated ?? post.date,
    })),
    ...getAllTags().map(({ tag }) => ({ url: `${SITE_URL}/blog/tags/${tag}` })),
  ];
}
