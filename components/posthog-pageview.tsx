"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Sends a $pageview on every App Router navigation (path or query change).
 * Uses useSearchParams, so render it inside <Suspense>.
 */
export function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    track("$pageview", { $current_url: window.location.href });
  }, [pathname, search]);

  return null;
}
