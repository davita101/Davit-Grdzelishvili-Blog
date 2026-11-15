import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setAnalyticsClient } from "@/lib/analytics";

const posthog = vi.hoisted(() => ({ init: vi.fn(), capture: vi.fn() }));
vi.mock("posthog-js/dist/module.slim", () => ({ default: posthog }));

const nav = vi.hoisted(() => ({ pathname: "/", search: "" }));
vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(nav.search),
}));

import { PostHogProvider } from "@/components/posthog-provider";

beforeEach(() => {
  nav.pathname = "/";
  nav.search = "";
});

afterEach(() => {
  // Unmount first: a provider that turns ready as a test ends would otherwise track
  // its $pageview after the client is reset, and the buffered event would leak into
  // the next test when that test's provider sets the client.
  cleanup();
  vi.clearAllMocks();
  setAnalyticsClient(null);
});

const pageviews = () => posthog.capture.mock.calls.filter(([event]) => event === "$pageview");

describe("PostHogProvider", () => {
  it.each([[undefined], [""], ["   "]])("does nothing with key %j: children only, no init", async (key) => {
    render(
      <PostHogProvider apiKey={key}>
        <p>Page</p>
      </PostHogProvider>,
    );
    expect(screen.getByText("Page")).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 0));
    expect(posthog.init).not.toHaveBeenCalled();
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("inits cookieless with no autocapture or auto pageviews", async () => {
    render(<PostHogProvider apiKey="phc_test" apiHost="https://eu.i.posthog.com">x</PostHogProvider>);
    await waitFor(() => expect(posthog.init).toHaveBeenCalledTimes(1));
    expect(posthog.init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({
        api_host: "https://eu.i.posthog.com",
        persistence: "memory",
        capture_pageview: false,
        autocapture: false,
        disable_session_recording: true,
        disable_external_dependency_loading: true,
        advanced_disable_flags: true,
      }),
    );
  });

  it("defaults the host to the EU region", async () => {
    render(<PostHogProvider apiKey="phc_test" apiHost="">x</PostHogProvider>);
    await waitFor(() => expect(posthog.init).toHaveBeenCalled());
    expect(posthog.init.mock.calls[0][1]).toMatchObject({ api_host: "https://eu.i.posthog.com" });
  });

  it("sends one $pageview on load and one per path or query change", async () => {
    const { rerender } = render(<PostHogProvider apiKey="phc_test">x</PostHogProvider>);
    await waitFor(() => expect(pageviews()).toHaveLength(1));

    nav.pathname = "/blog";
    rerender(<PostHogProvider apiKey="phc_test">x</PostHogProvider>);
    await waitFor(() => expect(pageviews()).toHaveLength(2));

    nav.search = "page=2";
    rerender(<PostHogProvider apiKey="phc_test">x</PostHogProvider>);
    await waitFor(() => expect(pageviews()).toHaveLength(3));

    rerender(<PostHogProvider apiKey="phc_test">x</PostHogProvider>);
    await new Promise((r) => setTimeout(r, 0));
    expect(pageviews()).toHaveLength(3);
    expect(pageviews()[0][1]).toEqual({ $current_url: expect.any(String) });
  });
});
