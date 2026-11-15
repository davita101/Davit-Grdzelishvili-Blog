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
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <Toc headings={post.headings} />
        </div>
      </aside>
    </div>
  );
}
