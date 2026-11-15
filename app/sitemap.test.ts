import { afterEach, describe, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";
import { getAllPosts, getAllTags } from "@/lib/content/posts";
import { SITE_URL } from "@/lib/site";

// content/posts has only draft posts right now: mdx-feature-tour and tables-and-task-lists.
const DRAFTS = ["mdx-feature-tour", "tables-and-task-lists"];

afterEach(() => vi.unstubAllEnvs());

const urls = () => sitemap().map((e) => e.url);

describe("sitemap", () => {
  it("lists the static pages", () => {
    expect(urls().slice(0, 4)).toEqual([SITE_URL, `${SITE_URL}/blog`, `${SITE_URL}/projects`, `${SITE_URL}/about`]);
  });

  it("lists every visible post with lastModified = updated ?? date, and every tag page", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const entries = sitemap();
    for (const post of getAllPosts()) {
      expect(entries).toContainEqual({ url: `${SITE_URL}/blog/${post.slug}`, lastModified: post.updated ?? post.date });
    }
    for (const { tag } of getAllTags()) {
      expect(entries.map((e) => e.url)).toContain(`${SITE_URL}/blog/tags/${tag}`);
    }
    for (const slug of DRAFTS) expect(urls()).toContain(`${SITE_URL}/blog/${slug}`);
  });

  it("has no draft and no draft-only tag when VERCEL_ENV=production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const list = urls();
    for (const slug of DRAFTS) expect(list).not.toContain(`${SITE_URL}/blog/${slug}`);
    expect(list.filter((u) => u.includes("/blog/tags/"))).toEqual(
      getAllTags().map(({ tag }) => `${SITE_URL}/blog/tags/${tag}`),
    );
  });
});
