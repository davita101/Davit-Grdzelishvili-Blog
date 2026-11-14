import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PostNav } from "@/components/post-nav";
import type { Post } from "@/lib/content/schema";

function post(slug: string, title: string): Post {
  return { slug, title, description: "d", date: "2026-11-01", tags: ["t"], readingTime: 1, headings: [] };
}
const newer = post("newer-post", "Newer title");
const older = post("older-post", "Older title");

describe("PostNav", () => {
  it("shows both links", () => {
    render(<PostNav prev={newer} next={older} />);
    expect(screen.getByRole("link", { name: /Newer title/ })).toHaveAttribute("href", "/blog/newer-post");
    expect(screen.getByRole("link", { name: /Older title/ })).toHaveAttribute("href", "/blog/older-post");
  });

  it("shows only prev", () => {
    render(<PostNav prev={newer} next={null} />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /Newer title/ })).toBeInTheDocument();
  });

  it("shows only next", () => {
    render(<PostNav prev={null} next={older} />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /Older title/ })).toBeInTheDocument();
  });

  it("renders nothing with no neighbours", () => {
    const { container } = render(<PostNav prev={null} next={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
