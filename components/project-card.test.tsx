import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectCard } from "@/components/project-card";

const project = {
  name: "Sample Project",
  description: "A sample project.",
  stack: ["Next.js", "TypeScript"],
  repo: "https://github.com/example/sample",
  live: "https://sample.example.com",
  featured: true,
};

describe("ProjectCard", () => {
  it("renders every field", () => {
    render(<ProjectCard {...project} />);
    expect(screen.getByRole("heading", { level: 2, name: "Sample Project" })).toBeInTheDocument();
    expect(screen.getByText("A sample project.")).toBeInTheDocument();
    const chips = within(screen.getByRole("list", { name: "Stack" })).getAllByRole("listitem");
    expect(chips.map((c) => c.textContent)).toEqual(["Next.js", "TypeScript"]);
    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("opens Repo and Live in a new tab with rel=noopener noreferrer", () => {
    render(<ProjectCard {...project} />);
    const repo = screen.getByRole("link", { name: /Sample Project repository/ });
    const live = screen.getByRole("link", { name: /Sample Project live site/ });
    expect(repo).toHaveAttribute("href", project.repo);
    expect(live).toHaveAttribute("href", project.live);
    for (const link of [repo, live]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("renders no link when repo and live are unset", () => {
    render(<ProjectCard {...project} repo={undefined} live={undefined} />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("renders only the links that are set", () => {
    render(<ProjectCard {...project} live={undefined} />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /repository/ })).toBeInTheDocument();
  });

  it("hides the Featured badge when not featured", () => {
    render(<ProjectCard {...project} featured={false} />);
    expect(screen.queryByText("Featured")).not.toBeInTheDocument();
  });

  it("renders the name as h3 when asked", () => {
    render(<ProjectCard {...project} headingLevel="h3" />);
    expect(screen.getByRole("heading", { level: 3, name: "Sample Project" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
  });
});
