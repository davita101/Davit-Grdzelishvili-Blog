import { compileMDX, type MDXRemoteProps } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings, { type Options as AutolinkOptions } from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { MdxImage } from "@/components/mdx/mdx-image";
import { MdxLink } from "@/components/mdx/mdx-link";
import { MdxPre } from "@/components/mdx/mdx-pre";
import { MdxTable } from "@/components/mdx/mdx-table";
import { getPostSource } from "@/lib/content/posts";

type MdxOptions = NonNullable<NonNullable<MDXRemoteProps["options"]>["mdxOptions"]>;
type HastNode = { type: string; value?: string; children?: HastNode[] };
type HastParent = { type: string; tagName?: string; name?: string | null; value?: string; children?: HastParent[] };

/** Components swapped in for MDX elements. */
export const mdxComponents: NonNullable<MDXRemoteProps["components"]> = {
  a: MdxLink,
  img: MdxImage,
  pre: MdxPre,
  table: MdxTable,
};

/** Plain text of a hast node, for the anchor's accessible name. */
function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

/** An anchor after each h2/h3: a visible "#" plus a screen-reader label naming the section. */
export const autolinkOptions: AutolinkOptions = {
  test: ["h2", "h3"],
  behavior: "append",
  properties: { className: ["heading-anchor"] },
  content: (heading) => [
    {
      type: "element",
      tagName: "span",
      properties: { ariaHidden: "true" },
      children: [{ type: "text", value: "#" }],
    },
    {
      type: "element",
      tagName: "span",
      properties: { className: ["sr-only"] },
      children: [{ type: "text", value: `Link to section: ${textOf(heading as HastNode)}` }],
    },
  ],
};

/** An image in the tree: a Markdown image, or an <img> written as JSX in MDX. */
function isImage(node: HastParent): boolean {
  if (node.type === "element") return node.tagName === "img";
  return (node.type === "mdxJsxTextElement" || node.type === "mdxJsxFlowElement") && node.name === "img";
}

function isBlankText(node: HastParent): boolean {
  return node.type === "text" && !node.value?.trim();
}

/**
 * MdxImage renders a <figure>, which is not allowed inside <p>. Markdown wraps an
 * image on its own line in a paragraph, and the browser then reshapes <p><figure>,
 * so React's hydration fails (#418). This rehype step:
 * - drops the <p> around a paragraph that holds only images (and whitespace);
 * - turns a <p> that mixes text and an image into a <div>.
 */
export function rehypeUnwrapImages() {
  function visit(parent: HastParent): void {
    const children = parent.children;
    if (!children) return;
    const next: HastParent[] = [];
    for (const child of children) {
      visit(child);
      const isParagraph = child.type === "element" && child.tagName === "p";
      const inner = child.children ?? [];
      if (isParagraph && inner.some(isImage)) {
        if (inner.every((c) => isImage(c) || isBlankText(c))) {
          next.push(...inner.filter(isImage));
          continue;
        }
        child.tagName = "div";
      }
      next.push(child);
    }
    parent.children = next;
  }
  return (tree: HastParent) => visit(tree);
}

/** Shiki dual theme; CSS in globals.css picks the colors from the .dark class. Build time only, no client JS. */
export const prettyCodeOptions: PrettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark" },
  keepBackground: false,
  defaultLang: { block: "plaintext" },
};

export const mdxOptions: MdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    rehypeUnwrapImages,
    rehypeSlug,
    [rehypeAutolinkHeadings, autolinkOptions],
    [rehypePrettyCode, prettyCodeOptions],
  ],
};

/** Compiles an MDX string with the post plugins and components. */
export async function compilePostMdx(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    // JS expressions in MDX stay blocked (next-mdx-remote's default).
    options: { mdxOptions, parseFrontmatter: false },
  });
  return content;
}

/**
 * Renders one post. The source only ever comes from getPostSource(), which reads
 * content/posts (project.md §7). Returns null for an unknown slug.
 */
export async function renderPost(slug: string) {
  const source = getPostSource(slug);
  return source === null ? null : compilePostMdx(source);
}
