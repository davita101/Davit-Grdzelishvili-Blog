import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MdxPre } from "@/components/mdx/mdx-pre";

describe("MdxPre", () => {
  it("pads the top of the code so the copy button doesn't cover the first line", () => {
    const { container } = render(
      <MdxPre data-language="ts">
        <code>const a = 1;</code>
      </MdxPre>,
    );
    const pre = container.querySelector("pre");
    expect(pre).toHaveClass("pt-10");
    expect(pre).toHaveAttribute("data-language", "ts");
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
  });

  it("keeps a className passed by the highlighter", () => {
    const { container } = render(
      <MdxPre className="shiki">
        <code>x</code>
      </MdxPre>,
    );
    expect(container.querySelector("pre")).toHaveClass("pt-10", "shiki");
  });
});
