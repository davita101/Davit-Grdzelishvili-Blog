import fs from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage from "@/app/about/page";
import ProjectsPage from "@/app/projects/page";
import { ContactBlock } from "@/components/contact-block";
import { HomeHero } from "@/components/home-hero";
import { MdxLink } from "@/components/mdx/mdx-link";
import { ProjectCard } from "@/components/project-card";
import { FooterContent } from "@/components/site-footer";

/**
 * project.md §7: every target="_blank" link has rel="noopener noreferrer".
 * Layer 1 renders everything that opens a new tab and checks each link. Compiled
 * posts are covered in lib/mdx.test.tsx ("routes links through MdxLink").
 * Layer 2 fails when a new file uses "_blank" without being added to layer 1.
 */

/** Source files (relative to the repo root) that render target="_blank". Each is rendered below. */
const FILES_WITH_BLANK_TARGETS = [
  "components/contact-block.tsx",
  "components/home-hero.tsx",
  "components/mdx/mdx-link.tsx",
  "components/project-card.tsx",
  "components/site-footer.tsx",
];

function blankLinks(root: ParentNode): HTMLAnchorElement[] {
  return [...root.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')];
}

function expectSafeRel(links: HTMLAnchorElement[]) {
  expect(links.length).toBeGreaterThan(0);
  for (const link of links) {
    const rel = (link.getAttribute("rel") ?? "").split(/\s+/);
    expect(rel, `${link.outerHTML} needs rel="noopener noreferrer"`).toEqual(
      expect.arrayContaining(["noopener", "noreferrer"]),
    );
  }
}

describe('target="_blank" links (project.md §7)', () => {
  it.each([
    ["site footer", <FooterContent key="f" year={2026} />],
    ["home hero", <HomeHero key="h" />],
    ["contact block", <ContactBlock key="c" />],
    [
      "project card",
      <ProjectCard
        key="p"
        name="Sample"
        description="A sample project."
        stack={["TypeScript"]}
        repo="https://github.com/example/sample"
        live="https://example.com"
        featured={false}
      />,
    ],
    ["MDX external link", <MdxLink key="m" href="https://example.com">Example</MdxLink>],
    ["about page", <AboutPage key="a" />],
    ["projects page", <ProjectsPage key="pr" />],
  ])("%s: every new-tab link has noopener noreferrer", (_name, ui) => {
    const { container } = render(ui);
    expectSafeRel(blankLinks(container));
  });

  it('every source file that uses "_blank" is covered by the render checks above', () => {
    const root = process.cwd();
    const found: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
        const rel = path.posix.join(dir, entry.name);
        if (entry.isDirectory()) walk(rel);
        else if (/\.(tsx?|jsx?)$/.test(entry.name) && !/\.test\./.test(entry.name)) {
          if (fs.readFileSync(path.join(root, rel), "utf8").includes("_blank")) found.push(rel);
        }
      }
    };
    walk("app");
    walk("components");
    walk("lib");
    expect(found.sort()).toEqual([...FILES_WITH_BLANK_TARGETS].sort());
  });
});
