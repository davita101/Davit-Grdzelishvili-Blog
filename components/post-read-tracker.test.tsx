import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const track = vi.hoisted(() => vi.fn());
vi.mock("@/lib/analytics", () => ({ track }));

import { PostReadTracker } from "@/components/post-read-tracker";

type Callback = (entries: Array<Pick<IntersectionObserverEntry, "isIntersecting" | "boundingClientRect">>) => void;
let callback: Callback;
let observed: Element | null;
const disconnect = vi.fn();

beforeEach(() => {
  observed = null;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: Callback) {
        callback = cb;
      }
      observe(el: Element) {
        observed = el;
      }
      disconnect = disconnect;
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const at = (isIntersecting: boolean, top: number) => [
  { isIntersecting, boundingClientRect: { top } as DOMRectReadOnly },
];

describe("PostReadTracker", () => {
  it("watches a sentinel placed at 75% of the article", () => {
    const { getByTestId } = render(<PostReadTracker slug="hello" />);
    const sentinel = getByTestId("post-read-sentinel");
    expect(observed).toBe(sentinel);
    expect(sentinel.style.top).toBe("75%");
  });

  it("does not fire before the reader reaches 75%", () => {
    render(<PostReadTracker slug="hello" />);
    callback(at(false, 900));
    expect(track).not.toHaveBeenCalled();
  });

  it("fires post_read with the slug once, at 75%", () => {
    render(<PostReadTracker slug="hello" />);
    callback(at(true, 400));
    callback(at(true, 300));
    callback(at(false, -50));
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("post_read", { slug: "hello" });
    expect(disconnect).toHaveBeenCalled();
  });

  it("fires when a fast jump lands past the sentinel", () => {
    render(<PostReadTracker slug="hello" />);
    callback(at(false, -200));
    expect(track).toHaveBeenCalledWith("post_read", { slug: "hello" });
  });
});
