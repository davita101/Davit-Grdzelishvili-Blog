import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LatestPosts } from "@/components/latest-posts";
import { getAllPosts } from "@/lib/content/posts";
import type { Post } from "@/lib/content/schema";

vi.mock("@/lib/content/posts", () => ({ getAllPosts: vi.fn() }));

function makePost(n: number): Post {
  return {
    slug: `post-${n}`,
    title: `Title ${n}`,
    description: "d",
    date: `2026-01-0${10 - n}`,
    readingTime: 1,
    tags: ["a"],
    headings: [],
  };
}

beforeEach(() => vi.mocked(getAllPosts).mockReset());

describe("LatestPosts", () => {
  it("shows at most 3 posts, newest first, as h3 under an h2", () => {
    vi.mocked(getAllPosts).mockReturnValue([1, 2, 3, 4, 5].map(makePost));
    render(<LatestPosts />);
    expect(screen.getByRole("heading", { level: 2, name: "Latest posts" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Title 1",
      "Title 2",
      "Title 3",
    ]);
  });

  it("links View all posts to /blog", () => {
    vi.mocked(getAllPosts).mockReturnValue([makePost(1)]);
    render(<LatestPosts />);
    expect(screen.getByRole("link", { name: "View all posts" })).toHaveAttribute("href", "/blog");
  });

  it("shows the empty state under its heading when there are no posts", () => {
    vi.mocked(getAllPosts).mockReturnValue([]);
    render(<LatestPosts />);
    expect(screen.getByRole("heading", { level: 2, name: "Latest posts" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No posts yet. Check back soon.");
    expect(screen.queryByRole("link", { name: "View all posts" })).not.toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
