import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MdxImage } from "@/components/mdx/mdx-image";
import { isExternalHref, MdxLink } from "@/components/mdx/mdx-link";
import { MdxTable } from "@/components/mdx/mdx-table";

describe("MdxLink", () => {
  it("opens external links in a new tab with noopener noreferrer", () => {
    render(<MdxLink href="https://mdxjs.com/docs/">MDX docs</MdxLink>);
    const link = screen.getByRole("link", { name: "MDX docs" });
    expect(link).toHaveAttribute("href", "https://mdxjs.com/docs/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("doesn't let MDX override rel or target on external links", () => {
    render(
      <MdxLink href="https://example.com" rel="opener" target="_self">
        Example
      </MdxLink>,
    );
    const link = screen.getByRole("link", { name: "Example" });
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it.each(["/blog", "#section", "mailto:someone@example.com"])("keeps %s in the same tab", (href) => {
    render(<MdxLink href={href}>Link</MdxLink>);
    const link = screen.getByRole("link", { name: "Link" });
    expect(link).toHaveAttribute("href", href);
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("isExternalHref matches only http(s) URLs", () => {
    expect(isExternalHref("https://a.b")).toBe(true);
    expect(isExternalHref("HTTP://a.b")).toBe(true);
    expect(isExternalHref("/blog")).toBe(false);
    expect(isExternalHref("//evil.example")).toBe(false);
    expect(isExternalHref("mailto:x@y.z")).toBe(false);
  });
});

describe("MdxImage", () => {
  it("renders with its alt text", () => {
    render(<MdxImage src="/posts/x/diagram.png" alt="A diagram" />);
    expect(screen.getByRole("img", { name: "A diagram" })).toBeInTheDocument();
  });

  it("uses width and height from the MDX when given", () => {
    render(<MdxImage src="/posts/x/diagram.png" alt="Sized" width="600" height="300" />);
    const img = screen.getByRole("img", { name: "Sized" });
    expect(img).toHaveAttribute("width", "600");
    expect(img).toHaveAttribute("height", "300");
  });

  it.each([undefined, "", "   "])("throws when alt is %j", (alt) => {
    expect(() => render(<MdxImage src="/posts/x/diagram.png" alt={alt} />)).toThrow(/needs alt text/);
  });

  it("throws for a remote image (the CSP only allows 'self')", () => {
    expect(() => render(<MdxImage src="https://example.com/a.png" alt="Remote" />)).toThrow(
      /must be a site path/,
    );
  });

  it("shows a title as a caption", () => {
    render(<MdxImage src="/posts/x/diagram.png" alt="Captioned" title="Figure 1" />);
    expect(screen.getByText("Figure 1").tagName).toBe("FIGCAPTION");
  });
});

describe("MdxTable", () => {
  it("wraps the table in a focusable horizontal scroll region", () => {
    render(
      <MdxTable>
        <tbody>
          <tr>
            <td>cell</td>
          </tr>
        </tbody>
      </MdxTable>,
    );
    const region = screen.getByRole("region", { name: "Table" });
    expect(region).toHaveClass("overflow-x-auto");
    expect(region).toHaveAttribute("tabindex", "0");
    expect(within(region).getByRole("table")).toBeInTheDocument();
  });
});
