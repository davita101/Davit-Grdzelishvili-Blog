// @vitest-environment node
// Node, not jsdom: Shiki's WASM regex engine needs Node's fetch/stream APIs.
// The HTML is parsed with JSDOM so Testing Library queries still work.
import { getAllByRole, getByRole, getByText, within } from "@testing-library/dom";
import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { compilePostMdx, renderPost } from "@/lib/mdx";

async function renderMdx(source: string): Promise<HTMLElement> {
  const html = renderToStaticMarkup(await compilePostMdx(source));
  return new JSDOM(`<body>${html}</body>`).window.document.body;
}

describe("compilePostMdx (full pipeline)", () => {
  const source = [
    "## Getting started",
    "",
    "Read [the docs](https://example.com) or [the blog](/blog).",
    "",
    "| A | B |",
    "| - | - |",
    "| 1 | 2 |",
    "",
    "- [x] done",
    "- [ ] todo",
    "",
    '```ts title="lib/a.ts"',
    "const answer: number = 42;",
    "```",
  ].join("\n");

  it("adds an accessible anchor to h2/h3 with a rehype-slug id", async () => {
    const body = await renderMdx(source);
    const heading = getByRole(body, "heading", { level: 2 });
    expect(heading.id).toBe("getting-started");
    const anchor = within(heading).getByRole("link", { name: /Link to section: Getting started/ });
    expect(anchor.getAttribute("href")).toBe("#getting-started");
  });

  it("routes links through MdxLink", async () => {
    const body = await renderMdx(source);
    expect(getByRole(body, "link", { name: "the docs" }).getAttribute("rel")).toBe("noopener noreferrer");
    expect(getByRole(body, "link", { name: "the blog" }).hasAttribute("target")).toBe(false);
  });

  it("renders GFM tables (scrollable) and task lists", async () => {
    const body = await renderMdx(source);
    expect(within(getByRole(body, "region", { name: "Table" })).getByRole("table")).toBeTruthy();
    const boxes = getAllByRole(body, "checkbox");
    expect(boxes.map((b) => (b as HTMLInputElement).checked)).toEqual([true, false]);
  });

  it("highlights code with both themes and shows the file name", async () => {
    const body = await renderMdx(source);
    expect(getByText(body, "lib/a.ts").hasAttribute("data-rehype-pretty-code-title")).toBe(true);
    const styled = body.querySelector("pre code span[style*='--shiki-light']");
    expect(styled?.getAttribute("style")).toContain("--shiki-dark");
  });

  it("strips JS expressions in MDX instead of running them", async () => {
    const body = await renderMdx('Before {"INJECTED".toLowerCase()} after');
    expect(body.textContent).not.toMatch(/injected/i);
    expect(body.textContent).toContain("Before");
  });
});

describe("renderPost", () => {
  it("renders a sample post from content/posts", async () => {
    const content = await renderPost("tables-and-task-lists");
    expect(content).not.toBeNull();
    const html = renderToStaticMarkup(content!);
    expect(html).toContain('id="tables"');
  });

  it("returns null for an unknown slug", async () => {
    expect(await renderPost("does-not-exist")).toBeNull();
  });
});
