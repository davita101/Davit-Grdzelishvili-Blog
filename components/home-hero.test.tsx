import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeHero } from "@/components/home-hero";
import { site } from "@/lib/site";

describe("HomeHero", () => {
  it("renders the name as the only h1, plus headline, stack and bio", () => {
    render(<HomeHero />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(site.name);
    const stack = screen.getByText(site.headlineStack);
    // The headline is the paragraph that holds the stack line.
    expect(stack.parentElement).toHaveTextContent(`${site.headline}${site.headlineStack}`);
    expect(screen.getByText(site.bio)).toBeInTheDocument();
  });

  it("renders the avatar with alt text containing the name", () => {
    render(<HomeHero />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", expect.stringContaining(site.name));
  });

  it("shows the Open to work badge and status when openToWork is true", () => {
    render(<HomeHero site={{ ...site, openToWork: true }} />);
    expect(screen.getByText("Open to work")).toBeInTheDocument();
    expect(screen.getByText(site.workStatus)).toBeInTheDocument();
  });

  it("hides the badge when openToWork is false", () => {
    render(<HomeHero site={{ ...site, openToWork: false }} />);
    expect(screen.queryByText("Open to work")).not.toBeInTheDocument();
    expect(screen.queryByText(site.workStatus)).not.toBeInTheDocument();
  });

  it("Contact is a same-tab mailto link", () => {
    render(<HomeHero />);
    const contact = screen.getByRole("link", { name: /contact/i });
    expect(contact).toHaveAttribute("href", site.links.email);
    expect(contact.getAttribute("href")).toMatch(/^mailto:/);
    expect(contact).not.toHaveAttribute("target");
  });

  it.each([
    ["GitHub", site.links.github],
    ["LinkedIn", site.links.linkedin],
  ])("%s opens the profile in a new tab with noopener noreferrer", (name, href) => {
    render(<HomeHero />);
    const link = screen.getByRole("link", { name: new RegExp(`^${name}`) });
    expect(link).toHaveAttribute("href", href);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
