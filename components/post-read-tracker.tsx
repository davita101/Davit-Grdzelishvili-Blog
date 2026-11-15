"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/**
 * Sends post_read { slug } once, when the reader scrolls past 75% of the post.
 * Renders an invisible sentinel at 75% of its positioned parent (the article).
 * Key it by slug so each post view gets a fresh tracker.
 */
export function PostReadTracker({ slug }: { slug: string }) {
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let sent = false;
    const observer = new IntersectionObserver((entries) => {
      // Fires when the sentinel enters the viewport, or is already above it after a fast jump.
      const reached = entries.some((e) => e.isIntersecting || e.boundingClientRect.top < 0);
      if (!reached || sent) return;
      sent = true;
      track("post_read", { slug });
      observer.disconnect();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [slug]);

  return (
    <div
      ref={sentinel}
      aria-hidden="true"
      data-testid="post-read-sentinel"
      className="pointer-events-none absolute left-0 h-px w-px"
      style={{ top: "75%" }}
    />
  );
}
