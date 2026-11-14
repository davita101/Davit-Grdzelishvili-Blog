import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound, { metadata } from "@/app/not-found";

describe("NotFound", () => {
  it("has one h1 that says the page wasn't found", () => {
    render(<NotFound />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(/not found/i);
  });

  it("links to Home and Blog", () => {
    render(<NotFound />);
    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Read the blog" })).toHaveAttribute("href", "/blog");
  });

  it("sets the title to Not found", () => {
    expect(metadata.title).toBe("Not found");
  });
});
