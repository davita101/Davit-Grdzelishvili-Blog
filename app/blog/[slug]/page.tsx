import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostHeader } from "@/components/post-header";
import { getAllPosts, getPostBySlug } from "@/lib/content/posts";
import { renderPost } from "@/lib/mdx";
import { SITE_URL } from "@/lib/site";

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
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
  };
}

/**
 * Post data plus compiled MDX, cached so it's prerendered at build time
 * (Cache Components treats the MDX compiler's timing calls as dynamic otherwise).
 */
async function loadPost(slug: string) {
  "use cache";
  console.error("DEBUG loadPost", slug, JSON.stringify(process.env.VERCEL_ENV));
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

  return (
    <article className="mx-auto max-w-content px-4 py-12 sm:py-16">
      <PostHeader {...post} />
      <div className="post-body mt-10">{content}</div>
    </article>
  );
}
