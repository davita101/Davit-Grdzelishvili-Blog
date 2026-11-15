import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BlogPage from "@/app/blog/page";
import { getAllPosts } from "@/lib/content/posts";
import type { Post } from "@/lib/content/schema";

vi.mock("@/lib/content/posts", () => ({ getAllPosts: vi.fn() }));

const post: Post = {
  slug: "sample",
  title: "Sample",
  description: "A sample post.",
  date: "2026-11-10",
  tags: ["sample"],
  readingTime: 1,
  headings: [],
};

beforeEach(() => vi.mocked(getAllPosts).mockReset());

describe("BlogPage", () => {
  it("with no published posts: one h1, the empty state, and no post count", () => {
    vi.mocked(getAllPosts).mockReturnValue([]);
    render(<BlogPage />);
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Blog" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No posts yet. Check back soon.");
    expect(screen.queryByText(/posts?, newest first/)).not.toBeInTheDocument();
  });

  it("with posts: shows the count and the list", () => {
    vi.mocked(getAllPosts).mockReturnValue([post]);
    render(<BlogPage />);
    expect(screen.getByText("1 post, newest first.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sample" })).toHaveAttribute("href", "/blog/sample");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
