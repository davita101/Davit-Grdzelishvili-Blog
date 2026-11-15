import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage, { metadata } from "@/app/about/page";
import { site } from "@/lib/site";

describe("AboutPage", () => {
  it("has one h1 with the name and sets the title to About", () => {
    render(<AboutPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(site.name);
    expect(metadata.title).toBe("About");
  });

  it("shows the avatar with alt text, the headline, skills and contact", () => {
    render(<AboutPage />);
    expect(screen.getByRole("img", { name: `Portrait of ${site.name}` })).toBeInTheDocument();
    expect(screen.getByText(site.headline)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Skills" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Contact" })).toBeInTheDocument();
  });
});
