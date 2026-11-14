import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { formatPostDate, PostHeader } from "@/components/post-header";

const base = {
  title: "MDX feature tour",
  date: "2026-11-12",
  readingTime: 3,
  tags: ["mdx", "nextjs"],
};

describe("formatPostDate", () => {
  it("formats in UTC so the day never shifts", () => {
    expect(formatPostDate("2026-11-12")).toBe("November 12, 2026");
    expect(formatPostDate("2026-01-01")).toBe("January 1, 2026");
  });
});

describe("PostHeader", () => {
  it("renders the title as the h1, the date, reading time and tags", () => {
    render(<PostHeader {...base} />);
    expect(screen.getByRole("heading", { level: 1, name: "MDX feature tour" })).toBeInTheDocument();
    const time = screen.getByText("November 12, 2026");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("datetime", "2026-11-12");
    expect(screen.getByText("3 min read")).toBeInTheDocument();
    const tags = within(screen.getByRole("list", { name: "Tags" })).getAllByRole("listitem");
    expect(tags.map((t) => t.textContent)).toEqual(["mdx", "nextjs"]);
  });

  it("shows Updated only when set", () => {
    const { rerender } = render(<PostHeader {...base} />);
    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
    rerender(<PostHeader {...base} updated="2026-11-20" />);
    expect(screen.getByText(/Updated/)).toHaveTextContent("Updated November 20, 2026");
  });

  it("renders the cover only when set, as a decorative image", () => {
    const { container, rerender } = render(<PostHeader {...base} />);
    expect(container.querySelector("img")).toBeNull();
    rerender(<PostHeader {...base} cover="/posts/x/cover.png" />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
  });
});
