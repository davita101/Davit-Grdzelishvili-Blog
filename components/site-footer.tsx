import { site } from "@/lib/site";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Year the build ran; cached so the static shell stays prerendered. */
async function currentYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function SiteFooter() {
  return <FooterContent year={await currentYear()} />;
}

export function FooterContent({ year }: { year: number }) {
  const linkClass = "text-muted-foreground transition-colors hover:text-foreground";

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-wide flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          © {year} {site.name}
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <a href={site.links.github} className={linkClass} {...external}>
              GitHub
            </a>
          </li>
          <li>
            <a href={site.links.linkedin} className={linkClass} {...external}>
              LinkedIn
            </a>
          </li>
          <li>
            <a href={site.links.email} className={linkClass}>
              Email
            </a>
          </li>
          <li>
            <a href="/rss.xml" className={linkClass}>
              RSS
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
