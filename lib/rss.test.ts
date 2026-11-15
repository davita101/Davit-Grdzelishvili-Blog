import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPostLoader } from "@/lib/content/posts";
import { buildRss, escapeXml, toRfc822 } from "@/lib/rss";
import { site } from "@/lib/site";

const fixtures = path.join(process.cwd(), "lib", "content", "__fixtures__", "posts");

const post = (slug: string, date: string, extra: Partial<{ title: string; description: string; tags: string[] }> = {}) => ({
  slug,
  title: `Title ${slug}`,
  description: `About ${slug}.`,
  date,
  tags: ["nextjs"],
  ...extra,
});

afterEach(() => vi.unstubAllEnvs());

describe("escapeXml", () => {
  it("escapes the five XML special characters", () => {
    expect(escapeXml(`<a href="x">Tom & Jerry's</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&apos;s&lt;/a&gt;",
    );
  });
});

describe("toRfc822", () => {
  it("formats a YYYY-MM-DD date as RFC 822 at midnight UTC", () => {
    expect(toRfc822("2026-11-12")).toBe("Thu, 12 Nov 2026 00:00:00 GMT");
  });
});

describe("buildRss", () => {
  it("builds the channel from lib/site.ts with an atom self link", () => {
    const xml = buildRss([], site);
    expect(xml).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">');
    expect(xml).toContain(`<title>${escapeXml(site.name)}</title>`);
    expect(xml).toContain(`<link>${site.url}</link>`);
    expect(xml).toContain(`<description>${escapeXml(site.bio)}</description>`);
    expect(xml).toContain(`<atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml"/>`);
    expect(xml).not.toContain("<item>");
  });

  it("writes each item with link, permalink guid, RFC 822 pubDate and a category per tag", () => {
    const xml = buildRss([post("hello", "2026-11-12", { tags: ["nextjs", "mdx"] })], site);
    const link = `${site.url}/blog/hello`;
    expect(xml).toContain("<title>Title hello</title>");
    expect(xml).toContain(`<link>${link}</link>`);
    expect(xml).toContain(`<guid isPermaLink="true">${link}</guid>`);
    expect(xml).toContain("<pubDate>Thu, 12 Nov 2026 00:00:00 GMT</pubDate>");
    expect(xml).toContain("<description>About hello.</description>");
    expect(xml).toContain("<category>nextjs</category>");
    expect(xml).toContain("<category>mdx</category>");
  });

  it("escapes XML in every text field", () => {
    const xml = buildRss(
      [post("x", "2026-11-12", { title: "A < B & C", description: `"quoted" <b>bold</b>` })],
      site,
    );
    expect(xml).toContain("<title>A &lt; B &amp; C</title>");
    expect(xml).toContain("<description>&quot;quoted&quot; &lt;b&gt;bold&lt;/b&gt;</description>");
    expect(xml).not.toContain("<b>");
  });

  it("keeps the order given (newest first from the loader)", () => {
    const xml = buildRss([post("new", "2026-11-12"), post("old", "2026-01-01")], site);
    expect(xml.indexOf("/blog/new")).toBeLessThan(xml.indexOf("/blog/old"));
  });

  it("has no draft when VERCEL_ENV=production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const xml = buildRss(createPostLoader(fixtures).getAllPosts(), site);
    expect(xml).toContain("/blog/newest-post");
    expect(xml).not.toContain("old-draft");
  });

  it("includes drafts on previews", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const xml = buildRss(createPostLoader(fixtures).getAllPosts(), site);
    expect(xml).toContain("/blog/old-draft");
  });
});
