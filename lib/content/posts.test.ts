import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPostLoader, extractHeadings, getAllPosts, getPostSource, readingTime } from "@/lib/content/posts";

const fixtures = path.join(__dirname, "__fixtures__");
const loader = () => createPostLoader(path.join(fixtures, "posts"));
const slugs = (posts: { slug: string }[]) => posts.map((p) => p.slug);

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getAllPosts", () => {
  it("sorts newest first by date, then slug A→Z, ignoring non-.mdx files", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(slugs(loader().getAllPosts())).toEqual([
      "newest-post",
      "same-day-a",
      "same-day-b",
      "old-draft",
    ]);
  });

  it("returns validated posts with derived fields", () => {
    const post = loader().getAllPosts().find((p) => p.slug === "old-draft");
    expect(post).toMatchObject({
      title: "Old draft",
      date: "2026-01-01", // unquoted YAML date, normalized to a string
      updated: "2026-01-05",
      tags: ["drafts", "typescript"],
      draft: true,
      cover: "/posts/old-draft/cover.png",
      slug: "old-draft",
      readingTime: 1,
      headings: [{ depth: 2, text: "Draft heading", id: "draft-heading" }],
    });
  });

  it("returns [] when the folder doesn't exist", () => {
    expect(createPostLoader(path.join(fixtures, "missing")).getAllPosts()).toEqual([]);
  });
});

describe("drafts", () => {
  it("are hidden when VERCEL_ENV=production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const l = loader();
    expect(slugs(l.getAllPosts())).not.toContain("old-draft");
    expect(l.getPostBySlug("old-draft")).toBeNull();
    expect(l.getPostSource("old-draft")).toBeNull();
    expect(l.getAllTags().map((t) => t.tag)).not.toContain("drafts");
    expect(l.getPostsByTag("drafts")).toEqual([]);
  });

  it.each([["preview"], ["development"], [""]])("are shown when VERCEL_ENV=%j", (env) => {
    vi.stubEnv("VERCEL_ENV", env);
    expect(slugs(loader().getAllPosts())).toContain("old-draft");
  });

  it("are shown when VERCEL_ENV is unset (local builds)", () => {
    vi.stubEnv("VERCEL_ENV", undefined);
    expect(slugs(loader().getAllPosts())).toContain("old-draft");
  });
});

describe("getPostBySlug / getPostSource", () => {
  it("finds a post and its raw MDX body without frontmatter", () => {
    const l = loader();
    expect(l.getPostBySlug("same-day-a")?.title).toBe("Same day A");
    const source = l.getPostSource("same-day-a");
    expect(source?.trim()).toBe("Body without headings.");
    expect(source).not.toContain("title:");
  });

  it("returns null for an unknown slug", () => {
    const l = loader();
    expect(l.getPostBySlug("nope")).toBeNull();
    expect(l.getPostSource("nope")).toBeNull();
  });
});

describe("getAllTags / getPostsByTag", () => {
  it("counts tags, most used first, then A→Z", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(loader().getAllTags()).toEqual([
      { tag: "testing", count: 3 },
      { tag: "typescript", count: 2 },
      { tag: "drafts", count: 1 },
      { tag: "nextjs", count: 1 },
    ]);
  });

  it("filters by tag in list order", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const l = loader();
    expect(slugs(l.getPostsByTag("typescript"))).toEqual(["same-day-a", "old-draft"]);
    expect(l.getPostsByTag("unknown")).toEqual([]);
  });
});

describe("getAdjacentPosts", () => {
  it("prev is the newer post, next the older one", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const { prev, next } = loader().getAdjacentPosts("same-day-a");
    expect(prev?.slug).toBe("newest-post");
    expect(next?.slug).toBe("same-day-b");
  });

  it("is null at the ends and for unknown slugs", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const l = loader();
    expect(l.getAdjacentPosts("newest-post").prev).toBeNull();
    expect(l.getAdjacentPosts("old-draft").next).toBeNull();
    expect(l.getAdjacentPosts("nope")).toEqual({ prev: null, next: null });
  });

  it("skips hidden drafts in production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(loader().getAdjacentPosts("same-day-b").next).toBeNull();
  });
});

describe("validation errors", () => {
  it("names the file and every bad field", () => {
    const l = createPostLoader(path.join(fixtures, "bad-frontmatter"));
    let message = "";
    try {
      l.getAllPosts();
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain("Invalid frontmatter in");
    expect(message).toContain(path.join("bad-frontmatter", "broken-post.mdx"));
    expect(message).toMatch(/- title: /);
    expect(message).toMatch(/- date: /);
    expect(message).toMatch(/- tags\.0: /);
  });

  it("rejects a file name that isn't a kebab-case slug", () => {
    const l = createPostLoader(path.join(fixtures, "bad-slug"));
    expect(() => l.getAllPosts()).toThrow(/Invalid post file name .*Bad_Slug\.mdx/);
  });
});

describe("extractHeadings", () => {
  it("numbers duplicates like rehype-slug, counting every level, and skips code fences", () => {
    const source = loader().getPostSource("newest-post") ?? "";
    expect(extractHeadings(source)).toEqual([
      { depth: 2, text: "Intro", id: "intro" },
      { depth: 2, text: "Intro", id: "intro-1" },
      { depth: 3, text: "Details with code and a link", id: "details-with-code-and-a-link" },
      // The h4 "Intro" takes intro-2 but isn't returned.
      { depth: 2, text: "Intro", id: "intro-3" },
    ]);
  });

  it("only closes a fence with the same marker", () => {
    const source = loader().getPostSource("same-day-b") ?? "";
    expect(extractHeadings(source)).toEqual([
      { depth: 2, text: "Only heading", id: "only-heading" },
      { depth: 3, text: "After the fence", id: "after-the-fence" },
    ]);
  });

  it("ignores h1, a missing space after #, and strips closing hashes and emphasis", () => {
    expect(extractHeadings("# Title\n##NoSpace\n## **Bold** _it_ ##\n")).toEqual([
      { depth: 2, text: "Bold it", id: "bold-it" },
    ]);
  });
});

describe("readingTime", () => {
  it("is ceil(words / 200), minimum 1", () => {
    expect(readingTime("")).toBe(1);
    expect(readingTime("word ".repeat(200))).toBe(1);
    expect(readingTime("word ".repeat(201))).toBe(2);
    expect(readingTime("word ".repeat(1000))).toBe(5);
  });
});

describe("content/posts (the real sample posts)", () => {
  it("are all valid drafts, so production shows none of them", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThanOrEqual(2);
    expect(posts.every((p) => p.draft === true)).toBe(true);

    vi.stubEnv("VERCEL_ENV", "production");
    expect(getAllPosts()).toEqual([]);
  });

  it("together cover every §6.4 MDX feature", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const all = getAllPosts()
      .map((p) => getPostSource(p.slug) ?? "")
      .join("\n");
    const languages = new Set([...all.matchAll(/^```(\w+)/gm)].map((m) => m[1]));
    expect(languages.size).toBeGreaterThanOrEqual(2);
    expect(all).toMatch(/^```\w+ title="[^"]+"/m); // file name label
    expect(all).toMatch(/^## /m);
    expect(all).toMatch(/^### /m);
    expect(all).toMatch(/[^`]`[^`\n]+`[^`]/); // inline code
    expect(all).toMatch(/^\|.*\|\n\|\s*:?-{3,}/m); // GFM table
    expect(all).toMatch(/^- \[[ x]\] /m); // task list
    expect(all).toMatch(/[^!]\[[^\]]+\]\(https?:\/\//); // link
    expect(all).toMatch(/!\[[^\]]+\]\(\/posts\/[a-z0-9-]+\/[^)]+\)/); // image with alt text
  });
});
