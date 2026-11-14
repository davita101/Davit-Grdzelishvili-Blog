import Link from "next/link";
import { formatPostDate } from "@/components/post-header";
import { TagChip } from "@/components/tag-chip";
import type { Post } from "@/lib/content/schema";

type PostCardProps = Pick<Post, "slug" | "title" | "description" | "date" | "readingTime" | "tags">;

/**
 * A post in a list. The title link covers the whole card (via ::after), and the
 * tag chips sit above it so they stay separately clickable, with no nested links.
 */
export function PostCard({ slug, title, description, date, readingTime, tags }: PostCardProps) {
  return (
    <article className="group relative flex flex-col gap-3 rounded-lg border bg-card p-5 transition-[translate,box-shadow] duration-200 hover:shadow-card motion-safe:hover:-translate-y-0.5 focus-within:shadow-card">
      <h2 className="text-lg font-semibold tracking-tight">
        <Link
          href={`/blog/${slug}`}
          className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:outline-2 focus-visible:after:outline-ring"
        >
          {title}
        </Link>
      </h2>
      <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
        <time dateTime={date}>{formatPostDate(date)}</time>
        <span aria-hidden="true">·</span>
        <span>{readingTime} min read</span>
      </p>
      <p className="text-muted-foreground">{description}</p>
      <ul aria-label="Tags" className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li key={tag}>
            <TagChip tag={tag} />
          </li>
        ))}
      </ul>
    </article>
  );
}
