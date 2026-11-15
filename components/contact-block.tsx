import { ArrowUpRight, Mail } from "lucide-react";
import type { SiteConfig } from "@/lib/content/schema";
import { site as defaultSite } from "@/lib/site";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

const linkClass =
  "inline-flex items-center gap-2 rounded-sm font-medium text-link underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Email, LinkedIn and GitHub, all from lib/site.ts. `site` is a prop only for tests. */
export function ContactBlock({ site = defaultSite }: { site?: SiteConfig }) {
  return (
    <section aria-labelledby="contact-heading" className="flex flex-col gap-4 rounded-lg border bg-card p-5">
      <h2 id="contact-heading" className="text-2xl font-semibold tracking-tight">
        Contact
      </h2>
      <ul className="flex flex-col gap-3">
        <li>
          <a href={site.links.email} className={linkClass}>
            <Mail aria-hidden="true" className="size-4" />
            {site.email}
          </a>
        </li>
        <li>
          <a href={site.links.linkedin} className={linkClass} {...external}>
            LinkedIn
            <ArrowUpRight aria-hidden="true" className="size-4" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
        <li>
          <a href={site.links.github} className={linkClass} {...external}>
            GitHub
            <ArrowUpRight aria-hidden="true" className="size-4" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      </ul>
    </section>
  );
}
