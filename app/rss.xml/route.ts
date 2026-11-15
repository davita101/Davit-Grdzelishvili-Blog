import { getAllPosts } from "@/lib/content/posts";
import { buildRss } from "@/lib/rss";
import { site } from "@/lib/site";

/** RSS 2.0 feed of published posts. Prerendered at build time. */
export function GET() {
  return new Response(buildRss(getAllPosts(), site), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
