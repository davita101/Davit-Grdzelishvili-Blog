import type { PostHog } from "posthog-js";

type Properties = Record<string, string | number | boolean | null>;
type Client = Pick<PostHog, "capture">;

/** Most events kept while PostHog is still loading; later ones are dropped. */
export const MAX_BUFFERED_EVENTS = 20;

/** The PostHog client the provider set up, or null when analytics is off or not loaded yet. */
let client: Client | null = null;

/**
 * Events tracked before the client is set (posthog-js loads lazily after hydration,
 * so a short post can hit 75% first). Kept in memory only, and never sent if no
 * client is ever set (no key).
 */
let buffer: Array<[event: string, properties?: Properties]> = [];

/**
 * Called by PostHogProvider once posthog-js is initialized: sends the buffered
 * events in order, then sends directly. Pass null to turn analytics off; that
 * also drops the buffer.
 */
export function setAnalyticsClient(next: Client | null): void {
  client = next;
  const pending = buffer;
  buffer = [];
  if (!next) return;
  for (const [event, properties] of pending) next.capture(event, properties);
}

/** Sends an event, or buffers it (up to MAX_BUFFERED_EVENTS) until PostHog is initialized. */
export function track(event: string, properties?: Properties): void {
  if (client) {
    client.capture(event, properties);
    return;
  }
  if (buffer.length < MAX_BUFFERED_EVENTS) buffer.push([event, properties]);
}
