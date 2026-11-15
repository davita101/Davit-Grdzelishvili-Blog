import { afterEach, describe, expect, it, vi } from "vitest";
import { MAX_BUFFERED_EVENTS, setAnalyticsClient, track } from "@/lib/analytics";

afterEach(() => setAnalyticsClient(null));

describe("track", () => {
  it("does not throw when PostHog is not initialized", () => {
    expect(() => track("post_read", { slug: "hello" })).not.toThrow();
  });

  it("sends the event once a client is set", () => {
    const capture = vi.fn();
    setAnalyticsClient({ capture } as never);
    track("post_read", { slug: "hello" });
    expect(capture).toHaveBeenCalledWith("post_read", { slug: "hello" });
  });

  it("buffers events tracked before the client is set, then flushes them in order", () => {
    track("post_read", { slug: "short-post" });
    track("outbound_click", { href: "https://github.com/davita101" });
    const capture = vi.fn();
    setAnalyticsClient({ capture } as never);
    expect(capture.mock.calls).toEqual([
      ["post_read", { slug: "short-post" }],
      ["outbound_click", { href: "https://github.com/davita101" }],
    ]);
    track("post_read", { slug: "next" });
    expect(capture).toHaveBeenCalledTimes(3);
  });

  it("flushes the buffer only once", () => {
    track("post_read", { slug: "a" });
    const first = vi.fn();
    setAnalyticsClient({ capture: first } as never);
    const second = vi.fn();
    setAnalyticsClient({ capture: second } as never);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
  });

  it(`keeps at most ${MAX_BUFFERED_EVENTS} early events`, () => {
    for (let i = 0; i < MAX_BUFFERED_EVENTS + 5; i++) track("e", { i });
    const capture = vi.fn();
    setAnalyticsClient({ capture } as never);
    expect(capture).toHaveBeenCalledTimes(MAX_BUFFERED_EVENTS);
    expect(capture.mock.calls.at(-1)).toEqual(["e", { i: MAX_BUFFERED_EVENTS - 1 }]);
  });

  it("drops the buffer when analytics is turned off (no key: nothing is ever sent)", () => {
    track("post_read", { slug: "dropped" });
    setAnalyticsClient(null);
    const capture = vi.fn();
    setAnalyticsClient({ capture } as never);
    expect(capture).not.toHaveBeenCalled();
  });

  it("stops sending after the client is cleared", () => {
    const capture = vi.fn();
    setAnalyticsClient({ capture } as never);
    setAnalyticsClient(null);
    track("post_read");
    expect(capture).not.toHaveBeenCalled();
  });
});
