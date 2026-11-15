import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AboutBio } from "@/components/about-bio";
import { site } from "@/lib/site";

describe("AboutBio", () => {
  it("never calls the course a degree, school or university", () => {
    const { container } = render(<AboutBio />);
    expect(container.textContent).not.toMatch(/degree|university|school/i);
  });

  it("mentions the GOA 2023 course exactly once", () => {
    const { container } = render(<AboutBio />);
    const matches = container.textContent?.match(/course at Goal-Oriented Academy from May to November 2023/g);
    expect(matches).toHaveLength(1);
  });

  it("reads name, location and work status from lib/site.ts", () => {
    const { container } = render(<AboutBio />);
    expect(container.textContent).toContain(site.name);
    expect(container.textContent).toContain(site.location);
    expect(container.textContent).toContain(site.workStatus);
  });

  it("is one or two paragraphs", () => {
    const { container } = render(<AboutBio />);
    const count = container.querySelectorAll("p").length;
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(2);
  });
});
