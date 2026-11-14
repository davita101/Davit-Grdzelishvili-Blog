import Link from "next/link";
import { cn } from "@/lib/utils";

/** A tag that links to its tag page. */
export function TagChip({ tag, className }: { tag: string; className?: string }) {
  return (
    <Link
      href={`/blog/tags/${tag}`}
      className={cn(
        "relative z-10 rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      {tag}
    </Link>
  );
}
