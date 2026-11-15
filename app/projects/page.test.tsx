import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Project } from "@/lib/content/schema";

const data = vi.hoisted(() => ({ projects: [] as Project[] }));
vi.mock("@/content/projects", () => data);

import ProjectsPage, { metadata } from "@/app/projects/page";

const make = (name: string, featured: boolean): Project => ({
  name,
  description: `${name} description.`,
  stack: ["TypeScript"],
  featured,
});

describe("ProjectsPage", () => {
  beforeEach(() => {
    data.projects = [make("Plain", false), make("Star", true)];
  });

  it("has one h1 and sets the title to Projects", () => {
    render(<ProjectsPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(metadata.title).toBe("Projects");
  });

  it("lists featured projects first", () => {
    render(<ProjectsPage />);
    const names = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(names).toEqual(["Star", "Plain"]);
  });

  it("shows an empty state when there are no projects", () => {
    data.projects = [];
    render(<ProjectsPage />);
    expect(within(screen.getByRole("status")).getByText(/No projects yet/)).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
