import Image from "next/image";
import { TagChip } from "@/components/tag-chip";
import type { Post } from "@/lib/content/schema";

/** "2026-11-12" → "November 12, 2026". UTC, so the day never shifts. */
export function formatPostDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

type PostHeaderProps = Pick<Post, "title" | "date" | "updated" | "readingTime" | "tags" | "cover">;

export function PostHeader({ title, date, updated, readingTime, tags, cover }: PostHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <time dateTime={date}>{formatPostDate(date)}</time>
        {updated && (
          <>
            <span aria-hidden="true">·</span>
            <span>
              Updated <time dateTime={updated}>{formatPostDate(updated)}</time>
            </span>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span>{readingTime} min read</span>
      </p>
      <ul aria-label="Tags" className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li key={tag}>
            <TagChip tag={tag} />
          </li>
        ))}
      </ul>
      {cover && (
        <span className="relative mt-4 block aspect-[1200/630] w-full overflow-hidden rounded-lg border">
          <Image src={cover} alt="" fill preload sizes="(min-width: 768px) 720px, 100vw" className="object-cover" />
        </span>
      )}
    </header>
  );
}
