import type { Post, SiteConfig } from "@/lib/content/schema";

type RssPost = Pick<Post, "slug" | "title" | "description" | "date" | "tags">;

/** Escapes the five XML special characters for text and attribute values. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** A YYYY-MM-DD date as an RFC 822 date at midnight UTC, e.g. "Thu, 12 Nov 2026 00:00:00 GMT". */
export function toRfc822(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

/**
 * RSS 2.0 for the given posts, in the order given (the loader sorts newest first
 * and already hides drafts in production). Every text field is XML-escaped.
 */
export function buildRss(posts: RssPost[], site: SiteConfig): string {
  const feedUrl = `${site.url}/rss.xml`;
  const items = posts.map((post) => {
    const link = `${site.url}/blog/${post.slug}`;
    const categories = post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`);
    return [
      "    <item>",
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${escapeXml(link)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
      `      <pubDate>${toRfc822(post.date)}</pubDate>`,
      `      <description>${escapeXml(post.description)}</description>`,
      ...categories,
      "    </item>",
    ].join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(site.name)}</title>`,
    `    <link>${escapeXml(site.url)}</link>`,
    `    <description>${escapeXml(site.bio)}</description>`,
    "    <language>en</language>",
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>`,
    ...(posts[0] ? [`    <lastBuildDate>${toRfc822(posts[0].date)}</lastBuildDate>`] : []),
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
