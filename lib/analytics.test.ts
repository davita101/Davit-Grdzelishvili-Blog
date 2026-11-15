import { afterEach, describe, expect, it, vi } from "vitest";
import { setAnalyticsClient, track } from "@/lib/analytics";

afterEach(() => setAnalyticsClient(null));

describe("track", () => {
  it("is a no-op when PostHog is not initialized", () => {
    expect(() => track("post_read", { slug: "hello" })).not.toThrow();
  });

  it("sends the event once a client is set", () => {
    const capture = vi.fn();
    setAnalyticsClient({ capture } as never);
    track("post_read", { slug: "hello" });
    expect(capture).toHaveBeenCalledWith("post_read", { slug: "hello" });
  });

  it("stops sending after the client is cleared", () => {
    const capture = vi.fn();
    setAnalyticsClient({ capture } as never);
    setAnalyticsClient(null);
    track("post_read");
    expect(capture).not.toHaveBeenCalled();
  });
});
