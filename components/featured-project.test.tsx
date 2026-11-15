import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeaturedProject } from "@/components/featured-project";
import type { Project } from "@/lib/content/schema";

const make = (name: string, featured: boolean): Project => ({
  name,
  description: `${name} description.`,
  stack: ["TypeScript"],
  featured,
});

describe("FeaturedProject", () => {
  it("renders the first featured project under a Featured project h2", () => {
    render(<FeaturedProject projects={[make("Plain", false), make("Star", true), make("Later", true)]} />);
    expect(screen.getByRole("heading", { level: 2, name: "Featured project" })).toBeInTheDocument();
    const h3s = screen.getAllByRole("heading", { level: 3 });
    expect(h3s.map((h) => h.textContent)).toEqual(["Star"]);
  });

  it("links to /projects", () => {
    render(<FeaturedProject projects={[make("Star", true)]} />);
    expect(screen.getByRole("link", { name: "All projects" })).toHaveAttribute("href", "/projects");
  });

  it("renders nothing when no project is featured", () => {
    const { container } = render(<FeaturedProject projects={[make("Plain", false)]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("uses content/projects.ts by default", () => {
    render(<FeaturedProject />);
    expect(screen.getByRole("heading", { level: 3, name: "Dashboard Constructor" })).toBeInTheDocument();
  });
});
