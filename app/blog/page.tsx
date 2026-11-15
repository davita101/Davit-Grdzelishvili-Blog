import type { Metadata } from "next";
import { PostList } from "@/components/post-list";
import { getAllPosts } from "@/lib/content/posts";
import { SITE_URL, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description: `Posts by ${site.name}.`,
  alternates: {
    canonical: `${SITE_URL}/blog`,
    types: { "application/rss+xml": [{ url: `${SITE_URL}/rss.xml`, title: `${site.name} RSS` }] },
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Blog</h1>
      {posts.length > 0 && (
        <p className="mt-2 text-muted-foreground">
          {posts.length === 1 ? "1 post" : `${posts.length} posts`}, newest first.
        </p>
      )}
      <div className="mt-8">
        <PostList posts={posts} />
      </div>
    </div>
  );
}
