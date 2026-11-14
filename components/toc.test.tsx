import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { nestHeadings, Toc } from "@/components/toc";
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
});
