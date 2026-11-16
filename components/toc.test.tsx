import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { activeHeadingId, nestHeadings, revealInPanel, Toc } from "@/components/toc";
import type { Heading } from "@/lib/content/schema";

const headings: Heading[] = [
  { depth: 2, text: "Intro", id: "intro" },
  { depth: 3, text: "Setup", id: "setup" },
  { depth: 3, text: "Usage", id: "usage" },
  { depth: 2, text: "Wrap up", id: "wrap-up" },
];

describe("nestHeadings", () => {
  it("puts h3s under the h2 before them", () => {
    const items = nestHeadings(headings);
    expect(items.map((i) => i.heading.id)).toEqual(["intro", "wrap-up"]);
    expect(items[0]?.children.map((c) => c.id)).toEqual(["setup", "usage"]);
    expect(items[1]?.children).toEqual([]);
  });

  it("keeps a leading h3 as its own item", () => {
    expect(nestHeadings([{ depth: 3, text: "Lone", id: "lone" }])).toHaveLength(1);
  });
});

describe("activeHeadingId", () => {
  const tops = (...values: number[]) => values.map((top, i) => ({ id: `h${i}`, top }));

  it("is null while the reader is above the first heading", () => {
    expect(activeHeadingId(tops(300, 900), 120)).toBeNull();
    expect(activeHeadingId([], 120)).toBeNull();
  });

  it("is the last heading that has passed the offset line", () => {
    expect(activeHeadingId(tops(-400, 120, 500), 120)).toBe("h1");
    expect(activeHeadingId(tops(-900, -400, -10), 120)).toBe("h2");
  });

  it("is the last heading at the bottom of the page, even if it never reached the offset", () => {
    expect(activeHeadingId(tops(-400, 300, 600), 120, true)).toBe("h2");
    expect(activeHeadingId([], 120, true)).toBeNull();
  });
});

describe("revealInPanel", () => {
  function box(top: number, bottom: number) {
    return () => ({ top, bottom }) as DOMRect;
  }
  function panel(scrollHeight: number, clientHeight: number) {
    const el = document.createElement("div");
    Object.defineProperty(el, "scrollHeight", { value: scrollHeight });
    Object.defineProperty(el, "clientHeight", { value: clientHeight });
    el.getBoundingClientRect = box(100, 500);
    return el;
  }

  it("scrolls the panel down so an item below it shows", () => {
    const p = panel(1000, 400);
    const item = document.createElement("a");
    item.getBoundingClientRect = box(520, 550);
    revealInPanel(p, item);
    expect(p.scrollTop).toBe(50);
  });

  it("scrolls the panel up so an item above it shows", () => {
    const p = panel(1000, 400);
    p.scrollTop = 200;
    const item = document.createElement("a");
    item.getBoundingClientRect = box(60, 90);
    revealInPanel(p, item);
    expect(p.scrollTop).toBe(160);
  });

  it("leaves the panel alone when the item is visible or the panel doesn't scroll", () => {
    const visible = panel(1000, 400);
    const item = document.createElement("a");
    item.getBoundingClientRect = box(200, 230);
    revealInPanel(visible, item);
    expect(visible.scrollTop).toBe(0);

    const short = panel(300, 400);
    item.getBoundingClientRect = box(520, 550);
    revealInPanel(short, item);
    expect(short.scrollTop).toBe(0);
  });
});

describe("Toc", () => {
  it("links every heading to its #id, with h3s nested", () => {
    render(<Toc headings={headings} />);
    const nav = screen.getByRole("navigation", { name: "Table of contents" });
    expect(within(nav).getByRole("link", { name: "Intro" })).toHaveAttribute("href", "#intro");
    expect(within(nav).getByRole("link", { name: "Wrap up" })).toHaveAttribute("href", "#wrap-up");
    const nested = within(screen.getByRole("link", { name: "Intro" }).closest("li") as HTMLElement);
    expect(nested.getByRole("link", { name: "Setup" })).toHaveAttribute("href", "#setup");
    expect(nested.getByRole("link", { name: "Usage" })).toHaveAttribute("href", "#usage");
  });

  it("renders nothing without headings", () => {
    const { container } = render(<Toc headings={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  describe("current heading", () => {
    let positions: Record<string, number> = {};

    afterEach(() => {
      document.body.innerHTML = "";
      window.history.replaceState(null, "", "/");
      vi.restoreAllMocks();
    });

    const current = () =>
      screen
        .queryAllByRole("link")
        .filter((a) => a.getAttribute("aria-current"))
        .map((a) => a.textContent);

    function instantFrames() {
      // Runs the frame at once. Returns 0 so the component's "frame pending" flag clears.
      vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        cb(0);
        return 0;
      });
    }

    function scroll() {
      act(() => {
        window.dispatchEvent(new Event("scroll"));
      });
    }

    function mountHeadings() {
      for (const h of headings) {
        const el = document.createElement("h2");
        el.id = h.id;
        el.getBoundingClientRect = () => ({ top: positions[h.id] ?? 0 }) as DOMRect;
        document.body.appendChild(el);
      }
    }

    it("marks the heading in view with aria-current and moves on scroll", () => {
      instantFrames();
      positions = { intro: 300, setup: 900, usage: 1500, "wrap-up": 2100 };
      mountHeadings();
      render(<Toc headings={headings} />);
      expect(current()).toEqual([]);

      positions = { intro: -500, setup: 40, usage: 640, "wrap-up": 1240 };
      scroll();
      expect(current()).toEqual(["Setup"]);
      expect(screen.getByRole("link", { name: "Setup" })).toHaveAttribute("aria-current", "location");
    });

    it("marks the last heading at the bottom of the page", () => {
      instantFrames();
      positions = { intro: -900, setup: -300, usage: 200, "wrap-up": 500 };
      mountHeadings();
      render(<Toc headings={headings} />);
      expect(current()).toEqual(["Setup"]);

      // Scrolled to the very bottom: usage and wrap-up can't reach the offset line.
      vi.spyOn(window, "scrollY", "get").mockReturnValue(1000);
      vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(window.innerHeight + 1000);
      scroll();
      expect(current()).toEqual(["Wrap up"]);
    });

    it("keeps a clicked heading active until the reader scrolls by hand", async () => {
      instantFrames();
      positions = { intro: -900, setup: 40, usage: 640, "wrap-up": 900 };
      mountHeadings();
      render(<Toc headings={headings} />);
      expect(current()).toEqual(["Setup"]);

      // The page can't bring "Usage" up to the offset line, so scroll events alone would keep "Setup".
      fireEvent.click(screen.getByRole("link", { name: "Usage" }));
      // Let the jump's hashchange land, as it does in a browser before the reader scrolls.
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      expect(current()).toEqual(["Usage"]);
      scroll();
      expect(current()).toEqual(["Usage"]);

      act(() => {
        window.dispatchEvent(new Event("wheel"));
      });
      scroll();
      expect(current()).toEqual(["Setup"]);
    });

    it("starts on the heading in the URL hash", () => {
      instantFrames();
      window.history.replaceState(null, "", "/#wrap-up");
      positions = { intro: 300, setup: 900, usage: 1500, "wrap-up": 2100 };
      mountHeadings();
      render(<Toc headings={headings} />);
      expect(current()).toEqual(["Wrap up"]);
    });
  });
});
