"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/content/schema";
import { cn } from "@/lib/utils";

type TocItem = { heading: Heading; children: Heading[] };

/** A heading counts as "in view" once its top passes this line (px from the viewport top). */
export const ACTIVE_OFFSET = 120;

/** Groups each h3 under the h2 before it. An h3 with no h2 before it stands alone. */
export function nestHeadings(headings: Heading[]): TocItem[] {
  const items: TocItem[] = [];
  for (const heading of headings) {
    const last = items.at(-1);
    if (heading.depth === 3 && last) last.children.push(heading);
    else items.push({ heading, children: [] });
  }
  return items;
}

/**
 * The id of the last heading whose top is at or above `offset`, or null when the
 * reader is still above the first one. `tops` are viewport tops in document order.
 */
export function activeHeadingId(tops: { id: string; top: number }[], offset = ACTIVE_OFFSET): string | null {
  let active: string | null = null;
  for (const { id, top } of tops) {
    if (top <= offset) active = id;
    else break;
  }
  return active;
}

/** Tracks which heading the reader is on, from the headings' positions on scroll. */
function useActiveHeading(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("\n");

  useEffect(() => {
    const list = key ? key.split("\n") : [];
    let frame = 0;
    const update = () => {
      frame = 0;
      const tops = list.flatMap((id) => {
        const el = document.getElementById(id);
        return el ? [{ id, top: el.getBoundingClientRect().top }] : [];
      });
      setActive(activeHeadingId(tops));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [key]);

  return active;
}

/** Sticky table of contents for wide screens. Renders nothing when the post has no headings. */
export function Toc({ headings }: { headings: Heading[] }) {
  const active = useActiveHeading(headings.map((h) => h.id));
  if (headings.length === 0) return null;
  const items = nestHeadings(headings);

  const link = (heading: Heading) => {
    const current = heading.id === active;
    return (
      <a
        href={`#${heading.id}`}
        aria-current={current ? "location" : undefined}
        className={cn(
          "block py-1 transition-colors hover:text-foreground",
          current ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {heading.text}
      </a>
    );
  };

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="mb-2 font-medium">On this page</p>
      <ul className="flex flex-col">
        {items.map(({ heading, children }) => (
          <li key={heading.id}>
            {link(heading)}
            {children.length > 0 && (
              <ul className="ml-3 border-l pl-3">
                {children.map((child) => (
                  <li key={child.id}>{link(child)}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
