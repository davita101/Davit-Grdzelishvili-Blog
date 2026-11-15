import type { PostHog } from "posthog-js";

type Properties = Record<string, string | number | boolean | null>;

/** The PostHog client the provider set up, or null when analytics is off. */
let client: Pick<PostHog, "capture"> | null = null;

/** Called by PostHogProvider once posthog-js is initialized. Pass null to turn analytics off. */
export function setAnalyticsClient(next: Pick<PostHog, "capture"> | null): void {
  client = next;
}

/** Sends an event. Does nothing when PostHog is not initialized (no key, or not loaded yet). */
export function track(event: string, properties?: Properties): void {
  client?.capture(event, properties);
}
