import { describe, expect, it } from "vitest";
import { truncateTitle } from "@/lib/og-image";

describe("truncateTitle", () => {
  it("keeps titles up to 90 characters as they are", () => {
    const title = "a".repeat(90);
    expect(truncateTitle(title)).toBe(title);
    expect(truncateTitle("Hello world")).toBe("Hello world");
  });

  it("trims and collapses whitespace", () => {
    expect(truncateTitle("  Hello \n  world  ")).toBe("Hello world");
  });

  it("cuts long titles at a word break with an ellipsis, within the limit", () => {
    const title = "Building a small portfolio blog with Next.js, MDX and Tailwind, and what I learned along the way";
    const out = truncateTitle(title);
    expect(out.length).toBeLessThanOrEqual(90);
    expect(out.endsWith("…")).toBe(true);
    expect(title.startsWith(out.slice(0, -1))).toBe(true);
    expect(out.slice(0, -1)).not.toMatch(/\s$/);
  });

  it("drops trailing punctuation before the ellipsis", () => {
    expect(truncateTitle("one two three, four five", 16)).toBe("one two three…");
  });

  it("hard-cuts a title with no usable word break", () => {
    const out = truncateTitle("x".repeat(120));
    expect(out).toBe(`${"x".repeat(89)}…`);
  });
});
