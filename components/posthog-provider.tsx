"use client";

import { Suspense, useEffect, useState } from "react";
import { PostHogPageview } from "@/components/posthog-pageview";
import { setAnalyticsClient } from "@/lib/analytics";

const DEFAULT_HOST = "https://eu.i.posthog.com";

type Props = {
  children: React.ReactNode;
  /** Defaults to NEXT_PUBLIC_POSTHOG_KEY. Unset or blank = analytics off. */
  apiKey?: string;
  /** Defaults to NEXT_PUBLIC_POSTHOG_HOST, then the EU host. */
  apiHost?: string;
};

/**
 * Cookieless PostHog (project.md §6.8). Without a key it renders only its children
 * and never loads posthog-js. With a key it loads posthog-js lazily, keeps state in
 * memory only (no cookies, no localStorage), and sends a $pageview per navigation.
 * No identify, no personal data.
 */
export function PostHogProvider({
  children,
  apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY,
  apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST,
}: Props) {
  const key = apiKey?.trim();
  const host = apiHost?.trim() || DEFAULT_HOST;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    import("posthog-js").then(({ default: posthog }) => {
      if (cancelled) return;
      posthog.init(key, {
        api_host: host,
        persistence: "memory",
        person_profiles: "identified_only",
        capture_pageview: false,
        capture_pageleave: false,
        autocapture: false,
        disable_session_recording: true,
        disable_surveys: true,
        // Don't pull extra scripts from PostHog's asset CDN (keeps the CSP to api_host).
        disable_external_dependency_loading: true,
        // No feature flags or remote config: skips /flags and the eu-assets /config fetch
        // (which the CSP blocks). Everything we use is set here instead.
        advanced_disable_flags: true,
      });
      setAnalyticsClient(posthog);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key, host]);

  return (
    <>
      {children}
      {ready && (
        <Suspense fallback={null}>
          <PostHogPageview />
        </Suspense>
      )}
    </>
  );
}
