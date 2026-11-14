/**
 * Post loader. Server only: reads MDX files from content/posts with node:fs.
 * Never reads from a URL or user input (project.md §7).
 */
import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import matter from "gray-matter";
import { CORE_SCHEMA, load as loadYaml } from "js-yaml";
import { type Heading, type Post, Post as PostSchema, PostFrontmatter, Slug } from "@/lib/content/schema";

export const POSTS_DIR = path.join(process.cwd(), "content", "posts");

const WORDS_PER_MINUTE = 200;

/**
 * YAML's default schema turns an unquoted 2026-13-45 into a rolled-over Date
 * (2027-02-14), hiding the mistake. The core schema keeps dates as the strings
 * the author wrote, so PostFrontmatter's YYYY-MM-DD check sees them as-is.
 * Passing options also turns off gray-matter's shared cache.
 */
const MATTER_OPTIONS = {
  engines: {
    yaml: (source: string) => loadYaml(source, { schema: CORE_SCHEMA }) as object,
  },
};

export type TagCount = { tag: string; count: number };
export type AdjacentPosts = { prev: Post | null; next: Post | null };

type LoadedPost = { post: Post; source: string };

/** Drafts show everywhere except Vercel production (project.md §5.1). Read at call time. */
function includeDrafts(): boolean {
  return process.env.VERCEL_ENV !== "production";
}

/** Minutes at 200 wpm, rounded up, at least 1. Counts every word of the MDX body. */
export function readingTime(source: string): number {
  const words = source.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** Plain text of a markdown heading, as rehype-slug sees it after rendering. */
function headingText(raw: string): string {
  return raw
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images → alt
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → text
    .replace(/`([^`]*)`/g, "$1") // inline code → code
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // italic
    .replace(/~~(.*?)~~/g, "$1") // strikethrough
    .trim();
}

/**
 * h2/h3 headings of an MDX body, skipping fenced code blocks. Ids come from one
 * github-slugger per post fed every heading level in order, the same way
 * rehype-slug numbers duplicates, so the ids match the rendered anchors.
 */
export function extractHeadings(source: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let fence: { char: string; length: number } | null = null;

  for (const line of source.split(/\r?\n/)) {
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!fence) {
        fence = { char: marker[0], length: marker.length };
        continue;
      }
      // A closing fence uses the same character, is at least as long, and has nothing after it.
      if (marker[0] === fence.char && marker.length >= fence.length && line.trim() === marker) {
        fence = null;
      }
      continue;
    }
    if (fence) continue;

    const match = /^ {0,3}(#{1,6})[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/.exec(line);
    if (!match) continue;
    const depth = match[1].length;
    const text = headingText(match[2]);
    if (!text) continue;
    const id = slugger.slug(text);
    if (depth === 2 || depth === 3) headings.push({ depth, text, id });
  }
  return headings;
}

function formatIssues(issues: { path: PropertyKey[]; message: string }[]): string {
  return issues
    .map((issue) => `  - ${issue.path.map(String).join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
}

function loadPost(dir: string, file: string): LoadedPost {
  const filePath = path.join(dir, file);
  const shown = path.relative(process.cwd(), filePath);
  const slug = file.replace(/\.mdx$/, "");

  const slugResult = Slug.safeParse(slug);
  if (!slugResult.success) {
    throw new Error(
      `Invalid post file name ${shown}: "${slug}" must be a lowercase kebab-case slug (e.g. my-post.mdx).`,
    );
  }

  const { data, content } = matter(fs.readFileSync(filePath, "utf8"), MATTER_OPTIONS);
  const frontmatter = PostFrontmatter.safeParse(data);
  if (!frontmatter.success) {
    throw new Error(`Invalid frontmatter in ${shown}:\n${formatIssues(frontmatter.error.issues)}`);
  }

  const post = PostSchema.parse({
    ...frontmatter.data,
    slug,
    readingTime: readingTime(content),
    headings: extractHeadings(content),
  });
  return { post, source: content };
}

/** Newest first by date, then slug A→Z. */
function comparePosts(a: Post, b: Post): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.slug.localeCompare(b.slug);
}

/** A loader over one folder. The app uses content/posts; tests pass a fixtures folder. */
export function createPostLoader(dir: string = POSTS_DIR) {
  function loadAll(): LoadedPost[] {
    if (!fs.existsSync(dir)) return [];
    const drafts = includeDrafts();
    return fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => loadPost(dir, file))
      .filter(({ post }) => drafts || !post.draft)
      .sort((a, b) => comparePosts(a.post, b.post));
  }

  function find(slug: string): LoadedPost | undefined {
    return loadAll().find(({ post }) => post.slug === slug);
  }

  return {
    /** Visible posts, newest first. */
    getAllPosts(): Post[] {
      return loadAll().map(({ post }) => post);
    },

    /** The post, or null if it doesn't exist or is a hidden draft. */
    getPostBySlug(slug: string): Post | null {
      return find(slug)?.post ?? null;
    },

    /** Raw MDX body (no frontmatter) for the renderer, or null. */
    getPostSource(slug: string): string | null {
      return find(slug)?.source ?? null;
    },

    /** Every tag on a visible post with its post count: most used first, then A→Z. */
    getAllTags(): TagCount[] {
      const counts = new Map<string, number>();
      for (const { post } of loadAll()) {
        for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
      return [...counts]
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
    },

    /** Visible posts with this tag, newest first. */
    getPostsByTag(tag: string): Post[] {
      return loadAll()
        .map(({ post }) => post)
        .filter((post) => post.tags.includes(tag));
    },

    /** Neighbours in list order (newest first): prev is the newer post, next the older one. */
    getAdjacentPosts(slug: string): AdjacentPosts {
      const posts = loadAll().map(({ post }) => post);
      const index = posts.findIndex((post) => post.slug === slug);
      if (index === -1) return { prev: null, next: null };
      return { prev: posts[index - 1] ?? null, next: posts[index + 1] ?? null };
    },
  };
}

const loader = createPostLoader();

export const getAllPosts = loader.getAllPosts;
export const getPostBySlug = loader.getPostBySlug;
export const getPostSource = loader.getPostSource;
export const getAllTags = loader.getAllTags;
export const getPostsByTag = loader.getPostsByTag;
export const getAdjacentPosts = loader.getAdjacentPosts;
