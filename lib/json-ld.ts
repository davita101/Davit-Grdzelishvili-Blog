import type { Post, SiteConfig } from "@/lib/content/schema";

/** A schema.org JSON-LD object. */
export type JsonLd = Record<string, unknown>;

/** Person on home: name, url, jobTitle and profiles, all from lib/site.ts. */
export function personJsonLd(site: SiteConfig): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: site.url,
    jobTitle: site.headline,
    sameAs: [site.links.github, site.links.linkedin],
  };
}

/** BlogPosting on a post page. dateModified falls back to the publish date. */
export function blogPostingJsonLd(
  post: Pick<Post, "slug" | "title" | "description" | "date" | "updated">,
  site: SiteConfig,
): JsonLd {
  const url = `${site.url}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { "@type": "Person", name: site.name, url: site.url },
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

/**
 * Serializes JSON-LD for a <script type="application/ld+json"> tag. Every "<"
 * becomes \u003c, so no value can close the script tag early.
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
