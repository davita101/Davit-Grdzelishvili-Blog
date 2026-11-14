import { FileText } from "lucide-react";
import { PostCard } from "@/components/post-card";
import type { Post } from "@/lib/content/schema";

/** Posts in the order given, or a designed empty state. */
export function PostList({ posts, emptyText = "No posts yet. Check back soon." }: { posts: Post[]; emptyText?: string }) {
  if (posts.length === 0) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
        <FileText aria-hidden="true" className="size-8 text-muted-foreground" />
        <p className="text-muted-foreground">{emptyText}</p>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-4">
      {posts.map((post) => (
        <li key={post.slug}>
          <PostCard {...post} />
        </li>
      ))}
    </ul>
  );
}
