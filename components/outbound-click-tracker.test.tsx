import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const track = vi.hoisted(() => vi.fn());
vi.mock("@/lib/analytics", () => ({ track }));

import { OutboundClickTracker, outboundHref } from "@/components/outbound-click-tracker";

afterEach(() => vi.clearAllMocks());

const origin = window.location.origin;

describe("outboundHref", () => {
  it("strips the query and hash from external links", () => {
    expect(outboundHref("https://github.com/davita101?tab=repos#top", origin)).toBe("https://github.com/davita101");
  });

  it("ignores same-origin links, relative links and non-web schemes", () => {
    expect(outboundHref(`${origin}/blog?x=1`, origin)).toBeNull();
    expect(outboundHref("/about", origin)).toBeNull();
    expect(outboundHref("mailto:someone@example.com", origin)).toBeNull();
    expect(outboundHref("tel:+995000000", origin)).toBeNull();
  });
});

describe("OutboundClickTracker", () => {
  function setup() {
    render(
      <>
        <OutboundClickTracker />
        <a href="https://github.com/davita101?utm_source=site#readme">
          <span>GitHub</span>
        </a>
        {/* A same-origin link written as a full URL (the check compares origins). */}
        <a href={`${origin}/blog`}>Blog</a>
        <a href="mailto:someone@example.com">Email</a>
      </>,
    );
  }

  it("sends outbound_click for an external link, without query or hash", () => {
    setup();
    fireEvent.click(screen.getByText("GitHub"));
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("outbound_click", { href: "https://github.com/davita101" });
  });

  it("sends nothing for internal or mailto links", () => {
    setup();
    fireEvent.click(screen.getByText("Blog"));
    fireEvent.click(screen.getByText("Email"));
    expect(track).not.toHaveBeenCalled();
  });

  it("counts a middle click but not a right click", () => {
    setup();
    fireEvent(screen.getByText("GitHub"), new MouseEvent("auxclick", { bubbles: true, button: 1 }));
    fireEvent(screen.getByText("GitHub"), new MouseEvent("auxclick", { bubbles: true, button: 2 }));
    expect(track).toHaveBeenCalledTimes(1);
  });
});
