import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PostList } from "@/components/post-list";
import type { Post } from "@/lib/content/schema";

function makePost(slug: string, date: string): Post {
  return { slug, title: `Title ${slug}`, description: "d", date, readingTime: 1, tags: ["a"], headings: [] };
}

describe("PostList", () => {
  it("shows the empty state when there are no posts", () => {
    render(<PostList posts={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent("No posts yet");
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("accepts custom empty text", () => {
    render(<PostList posts={[]} emptyText="Nothing here." />);
    expect(screen.getByRole("status")).toHaveTextContent("Nothing here.");
  });

  it("renders the posts in the order given", () => {
    render(<PostList posts={[makePost("newer", "2026-02-01"), makePost("older", "2026-01-01")]} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Title newer",
      "Title older",
    ]);
  });
});
