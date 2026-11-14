import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { getAllPosts } from "@/lib/content/posts";

const COUNT = 3;

/** The newest posts under the home hero. Hidden when there are none. */
export function LatestPosts() {
  const posts = getAllPosts().slice(0, COUNT);
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="latest-posts-heading" className="mt-16 sm:mt-24">
      <h2 id="latest-posts-heading" className="text-2xl font-semibold tracking-tight">
        Latest posts
      </h2>
      <ul className="mt-6 flex flex-col gap-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <PostCard {...post} headingLevel="h3" />
          </li>
        ))}
      </ul>
      <Link
        href="/blog"
        className="mt-6 inline-block rounded-sm text-sm font-medium text-link underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        View all posts
      </Link>
    </section>
  );
}
