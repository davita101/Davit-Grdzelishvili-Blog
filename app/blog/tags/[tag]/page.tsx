import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostList } from "@/components/post-list";
import { getAllTags, getPostsByTag } from "@/lib/content/posts";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ tag: string }> };

/**
 * Cache Components rejects `dynamicParams = false` and fails the build on an
 * empty list (production while every post is a draft). "_" can never be a tag
 * (tags are kebab-case), so it just prerenders the 404 page. Unknown tags 404
 * through notFound().
 */
const NO_TAGS_PLACEHOLDER = "_";

/**
 * Opt out of instant-navigation validation (the dev "URL data during prerendering"
 * insight). The page reads params outside <Suspense> on purpose: an unknown tag
 * must call notFound() before the response starts, so it returns a real 404.
 * Behind <Suspense> the shell streams first and the status is stuck at 200.
 * Known tags are still prerendered at build time.
 */
export const instant = false;

export function generateStaticParams() {
  const tags = getAllTags().map(({ tag }) => ({ tag }));
  return tags.length > 0 ? tags : [{ tag: NO_TAGS_PLACEHOLDER }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  if (getPostsByTag(tag).length === 0) return {};
  return {
    title: `Posts tagged ${tag}`,
    description: `Posts tagged ${tag}.`,
    alternates: { canonical: `${SITE_URL}/blog/tags/${tag}` },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        All posts
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        Posts tagged <span className="font-mono">{tag}</span>
      </h1>
      <div className="mt-8">
        <PostList posts={posts} />
      </div>
    </div>
  );
}
