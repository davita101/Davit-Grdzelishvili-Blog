import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContactBlock } from "@/components/contact-block";
import { site } from "@/lib/site";

describe("ContactBlock", () => {
  it("links the email as mailto from lib/site.ts", () => {
    render(<ContactBlock />);
    const email = screen.getByRole("link", { name: site.email });
    expect(email).toHaveAttribute("href", site.links.email);
    expect(email).not.toHaveAttribute("target");
  });

  it("opens LinkedIn and GitHub in a new tab with rel=noopener noreferrer", () => {
    render(<ContactBlock />);
    const linkedin = screen.getByRole("link", { name: /LinkedIn/ });
    const github = screen.getByRole("link", { name: /GitHub/ });
    expect(linkedin).toHaveAttribute("href", site.links.linkedin);
    expect(github).toHaveAttribute("href", site.links.github);
    for (const link of [linkedin, github]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
