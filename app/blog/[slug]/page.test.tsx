import { describe, expect, it, vi } from "vitest";
import type { Post } from "@/lib/content/schema";

const post: Post = {
  slug: "hello-world",
  title: "Hello world",
  description: "A first post.",
  date: "2026-11-12",
  updated: "2026-11-14",
  tags: ["nextjs", "mdx"],
  readingTime: 3,
  headings: [],
};

vi.mock("@/lib/content/posts", () => ({
  getPostBySlug: (slug: string) => (slug === post.slug ? post : undefined),
  getAllPosts: () => [post],
  getAdjacentPosts: () => ({ prev: null, next: null }),
}));
vi.mock("@/lib/mdx", () => ({ renderPost: async () => null }));

import { generateMetadata } from "@/app/blog/[slug]/page";
import { SITE_URL, site } from "@/lib/site";

const metaFor = (slug: string) => generateMetadata({ params: Promise.resolve({ slug }) });

describe("post page generateMetadata", () => {
  it("sets title, description and canonical", async () => {
    const meta = await metaFor("hello-world");
    expect(meta.title).toBe("Hello world");
    expect(meta.description).toBe("A first post.");
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/blog/hello-world`);
  });

  it("sets Open Graph article fields", async () => {
    const meta = await metaFor("hello-world");
    expect(meta.openGraph).toMatchObject({
      type: "article",
      siteName: site.name,
      url: `${SITE_URL}/blog/hello-world`,
      title: "Hello world",
      description: "A first post.",
      publishedTime: "2026-11-12",
      modifiedTime: "2026-11-14",
      tags: ["nextjs", "mdx"],
    });
  });

  it("sets the Twitter title and description", async () => {
    const meta = await metaFor("hello-world");
    expect(meta.twitter).toMatchObject({ title: "Hello world", description: "A first post." });
  });

  it("returns nothing for an unknown slug", async () => {
    expect(await metaFor("nope")).toEqual({});
  });
});
