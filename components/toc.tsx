import type { Heading } from "@/lib/content/schema";

type TocItem = { heading: Heading; children: Heading[] };

/** Groups each h3 under the h2 before it. An h3 with no h2 before it stands alone. */
export function nestHeadings(headings: Heading[]): TocItem[] {
  const items: TocItem[] = [];
  for (const heading of headings) {
    const last = items.at(-1);
    if (heading.depth === 3 && last) last.children.push(heading);
    else items.push({ heading, children: [] });
  }
  return items;
}

/** Sticky table of contents for wide screens. Renders nothing when the post has no headings. */
export function Toc({ headings }: { headings: Heading[] }) {
  if (headings.length === 0) return null;
  const items = nestHeadings(headings);
  const link = "block py-1 text-muted-foreground transition-colors hover:text-foreground";

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="mb-2 font-medium">On this page</p>
      <ul className="flex flex-col">
        {items.map(({ heading, children }) => (
          <li key={heading.id}>
            <a href={`#${heading.id}`} className={link}>
              {heading.text}
            </a>
            {children.length > 0 && (
              <ul className="ml-3 border-l pl-3">
                {children.map((child) => (
                  <li key={child.id}>
                    <a href={`#${child.id}`} className={link}>
                      {child.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
