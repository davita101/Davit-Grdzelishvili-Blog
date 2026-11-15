import { notFound } from "next/navigation";
import { formatPostDate } from "@/components/post-header";
import { getAllPosts, getPostBySlug } from "@/lib/content/posts";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { site } from "@/lib/site";

export const alt = `Blog post by ${site.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Same placeholder as the post page: Cache Components needs at least one param. */
const NO_POSTS_PLACEHOLDER = "_";

export function generateStaticParams() {
  const slugs = getAllPosts().map((post) => ({ slug: post.slug }));
  return slugs.length > 0 ? slugs : [{ slug: NO_POSTS_PLACEHOLDER }];
}

/** Per-post card: title, then date · reading time. */
export default async function PostOpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  return renderOgImage({
    title: post.title,
    subtitle: `${formatPostDate(post.date)} · ${post.readingTime} min read`,
  });
}
