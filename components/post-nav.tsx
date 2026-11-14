import Link from "next/link";
import type { AdjacentPosts } from "@/lib/content/posts";

const card = "flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-muted";

/** Previous (newer) and next (older) post links. A missing side is left out. */
export function PostNav({ prev, next }: AdjacentPosts) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="More posts" className="mt-16 grid gap-4 sm:grid-cols-2">
      {prev ? (
        <Link href={`/blog/${prev.slug}`} rel="prev" className={card}>
          <span className="text-xs text-muted-foreground">← Newer post</span>
          <span className="font-medium">{prev.title}</span>
        </Link>
      ) : null}
      {next ? (
        <Link href={`/blog/${next.slug}`} rel="next" className={`${card} sm:col-start-2 sm:text-right`}>
          <span className="text-xs text-muted-foreground">Older post →</span>
          <span className="font-medium">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
