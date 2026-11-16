import { act, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { activeHeadingId, nestHeadings, Toc } from "@/components/toc";
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
      vi.restoreAllMocks();
    });

    function mountHeadings() {
      for (const h of headings) {
        const el = document.createElement("h2");
        el.id = h.id;
        el.getBoundingClientRect = () => ({ top: positions[h.id] ?? 0 }) as DOMRect;
        document.body.appendChild(el);
      }
    }

    it("marks the heading in view with aria-current and moves on scroll", () => {
      vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        cb(0);
        return 1;
      });
      positions = { intro: 300, setup: 900, usage: 1500, "wrap-up": 2100 };
      mountHeadings();
      render(<Toc headings={headings} />);
      const current = () => screen.queryAllByRole("link").filter((a) => a.getAttribute("aria-current"));
      expect(current()).toEqual([]);

      positions = { intro: -500, setup: 40, usage: 640, "wrap-up": 1240 };
      act(() => {
        window.dispatchEvent(new Event("scroll"));
      });
      expect(current().map((a) => a.textContent)).toEqual(["Setup"]);
      expect(screen.getByRole("link", { name: "Setup" })).toHaveAttribute("aria-current", "location");
    });
  });
});
