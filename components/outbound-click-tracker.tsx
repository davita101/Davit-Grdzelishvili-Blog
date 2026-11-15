"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * The link's URL without query or hash when it points to another http(s) origin;
 * null for same-origin links and non-web schemes (mailto:, tel:).
 */
export function outboundHref(href: string, currentOrigin: string): string | null {
  let url: URL;
  try {
    url = new URL(href, currentOrigin);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.origin === currentOrigin) return null;
  return `${url.origin}${url.pathname}`;
}

/** One delegated listener: sends outbound_click { href } for clicks on external links. */
export function OutboundClickTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.type === "auxclick" && event.button !== 1) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const href = outboundHref(link.href, window.location.origin);
      if (href) track("outbound_click", { href });
    }
    // Capture phase, so a handler that stops propagation can't hide the click.
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, []);

  return null;
}
