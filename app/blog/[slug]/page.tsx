import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostHeader } from "@/components/post-header";
import { PostNav } from "@/components/post-nav";
import { PostReadTracker } from "@/components/post-read-tracker";
import { Toc } from "@/components/toc";
import { getAdjacentPosts, getAllPosts, getPostBySlug } from "@/lib/content/posts";
import { blogPostingJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { renderPost } from "@/lib/mdx";
import { SITE_URL, site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

/**
 * Cache Components fails the build if this returns nothing, which happens in
 * production while every post is a draft. "_" can never be a real slug (it fails
 * the Slug schema), so it just prerenders the 404 page.
 */
const NO_POSTS_PLACEHOLDER = "_";

/**
 * Opt out of instant-navigation validation (the dev "URL data during prerendering"
 * insight). The page reads params outside <Suspense> on purpose: an unknown slug
 * must call notFound() before the response starts, so it returns a real 404.
 * Behind <Suspense> the shell streams first and the status is stuck at 200.
 * Known slugs are still prerendered at build time.
 */
export const instant = false;

export function generateStaticParams() {
  const slugs = getAllPosts().map((post) => ({ slug: post.slug }));
  return slugs.length > 0 ? slugs : [{ slug: NO_POSTS_PLACEHOLDER }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    // Next replaces (not merges) the layout's openGraph, so repeat siteName and locale.
    openGraph: {
      type: "article",
      siteName: site.name,
      locale: "en_US",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: [site.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

/**
 * Post data plus compiled MDX, cached so it's prerendered at build time
 * (Cache Components treats the MDX compiler's timing calls as dynamic otherwise).
 */
async function loadPost(slug: string) {
  "use cache";
  const post = getPostBySlug(slug);
  if (!post) return null;
  const content = await renderPost(slug);
  return content ? { post, content } : null;
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const loaded = await loadPost(slug);
  if (!loaded) notFound();
  const { post, content } = loaded;

  const { prev, next } = getAdjacentPosts(slug);

  return (
    <div className="mx-auto flex max-w-wide justify-center gap-12 px-4 py-12 sm:py-16">
      <script
        type="application/ld+json"
        // serializeJsonLd escapes "<", so post content cannot close this tag.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogPostingJsonLd(post, site)) }}
      />
      <article className="relative w-full max-w-content min-w-0">
        <PostReadTracker key={post.slug} slug={post.slug} />
        <PostHeader {...post} />
        <div className="post-body mt-10">{content}</div>
        <PostNav prev={prev} next={next} />
      </article>
      {/* The aside itself sticks (self-start keeps it its own height), so it no longer
          relies on being stretched to the article's height. Long outlines scroll inside. */}
      <aside className="sticky top-24 hidden max-h-[calc(100svh-8rem)] w-56 shrink-0 self-start overflow-y-auto lg:block">
        <Toc headings={post.headings} />
      </aside>
    </div>
  );
}
