"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
 * At the bottom of the page the last headings can never reach `offset`, so the
 * last heading wins there.
 */
export function activeHeadingId(
  tops: { id: string; top: number }[],
  offset = ACTIVE_OFFSET,
  atBottom = false,
): string | null {
  if (atBottom && tops.length > 0) return tops.at(-1)?.id ?? null;
  let active: string | null = null;
  for (const { id, top } of tops) {
    if (top <= offset) active = id;
    else break;
  }
  return active;
}

/**
 * True when the window has been scrolled to (within 2px of) the bottom of the page.
 * A page that doesn't scroll (scrollY 0) never counts, so the first heading isn't skipped.
 */
function scrolledToBottom(): boolean {
  return (
    window.scrollY > 0 &&
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
  );
}

/** The heading id in the URL hash, if it is one of `ids`. */
function hashId(ids: string[]): string | null {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return ids.includes(id) ? id : null;
}

/** Events that mean the reader is scrolling by hand (not a jump to an anchor). */
const MANUAL_SCROLL_EVENTS = ["wheel", "touchmove", "keydown", "pointerdown"] as const;

/**
 * Tracks which heading the reader is on, from the headings' positions on scroll.
 * After a jump to a heading (outline click or hash change) that heading stays
 * active until the reader scrolls by hand, because a heading near the page bottom
 * can't be scrolled up to the offset line.
 */
function useActiveHeading(ids: string[]): [string | null, (id: string) => void] {
  const [active, setActive] = useState<string | null>(null);
  const pinned = useRef(false);
  const key = ids.join("\n");

  const pin = useCallback((id: string) => {
    pinned.current = true;
    setActive(id);
  }, []);

  useEffect(() => {
    const list = key ? key.split("\n") : [];
    let frame = 0;
    const update = () => {
      frame = 0;
      if (pinned.current) return;
      const tops = list.flatMap((id) => {
        const el = document.getElementById(id);
        return el ? [{ id, top: el.getBoundingClientRect().top }] : [];
      });
      setActive(activeHeadingId(tops, ACTIVE_OFFSET, scrolledToBottom()));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const unpin = () => {
      pinned.current = false;
    };
    const onHashChange = () => {
      const id = hashId(list);
      if (id) pin(id);
    };

    const initial = hashId(list);
    if (initial) pin(initial);
    else update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", onHashChange);
    for (const type of MANUAL_SCROLL_EVENTS) window.addEventListener(type, unpin, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("hashchange", onHashChange);
      for (const type of MANUAL_SCROLL_EVENTS) window.removeEventListener(type, unpin);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [key, pin]);

  return [active, pin];
}

/**
 * Scrolls `panel` (never the window) just enough to show `item`.
 * Does nothing when the panel doesn't scroll.
 */
export function revealInPanel(panel: HTMLElement, item: HTMLElement): void {
  if (panel.scrollHeight <= panel.clientHeight) return;
  const p = panel.getBoundingClientRect();
  const i = item.getBoundingClientRect();
  if (i.top < p.top) panel.scrollTop -= p.top - i.top;
  else if (i.bottom > p.bottom) panel.scrollTop += i.bottom - p.bottom;
}

/** Sticky table of contents for wide screens. Renders nothing when the post has no headings. */
export function Toc({ headings }: { headings: Heading[] }) {
  const [active, pin] = useActiveHeading(headings.map((h) => h.id));
  const navRef = useRef<HTMLElement>(null);

  // Keep the current link visible inside a long, scrolling outline panel.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !active) return;
    const item = nav.querySelector<HTMLElement>('[aria-current="location"]');
    const panel = nav.parentElement;
    if (item && panel) revealInPanel(panel, item);
  }, [active]);

  if (headings.length === 0) return null;
  const items = nestHeadings(headings);

  const link = (heading: Heading) => {
    const current = heading.id === active;
    return (
      <a
        href={`#${heading.id}`}
        aria-current={current ? "location" : undefined}
        onClick={() => pin(heading.id)}
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
    <nav ref={navRef} aria-label="Table of contents" className="text-sm">
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
