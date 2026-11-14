import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PostCard } from "@/components/post-card";
import { TagChip } from "@/components/tag-chip";

const post = {
  slug: "hello-world",
  title: "Hello world",
  description: "A first post.",
  date: "2026-11-12",
  readingTime: 4,
  tags: ["nextjs", "mdx"],
};

describe("PostCard", () => {
  it("renders every field", () => {
    render(<PostCard {...post} />);
    expect(screen.getByRole("heading", { level: 2, name: "Hello world" })).toBeInTheDocument();
    expect(screen.getByText("A first post.")).toBeInTheDocument();
    const time = screen.getByText("November 12, 2026");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("datetime", "2026-11-12");
    expect(screen.getByText("4 min read")).toBeInTheDocument();
  });

  it("links the title to the post and each tag to its tag page", () => {
    render(<PostCard {...post} />);
    expect(screen.getByRole("link", { name: "Hello world" })).toHaveAttribute("href", "/blog/hello-world");
    const tags = within(screen.getByRole("list", { name: "Tags" })).getAllByRole("link");
    expect(tags.map((t) => [t.textContent, t.getAttribute("href")])).toEqual([
      ["nextjs", "/blog/tags/nextjs"],
      ["mdx", "/blog/tags/mdx"],
    ]);
  });

  it("has no nested links", () => {
    const { container } = render(<PostCard {...post} />);
    expect(container.querySelectorAll("a a")).toHaveLength(0);
  });
});

describe("TagChip", () => {
  it("links to /blog/tags/<tag>", () => {
    render(<TagChip tag="react-19" />);
    expect(screen.getByRole("link", { name: "react-19" })).toHaveAttribute("href", "/blog/tags/react-19");
  });

  it("renders the title as h3 when asked", () => {
    render(<PostCard {...post} headingLevel="h3" />);
    expect(screen.getByRole("heading", { level: 3, name: "Hello world" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
  });
});
