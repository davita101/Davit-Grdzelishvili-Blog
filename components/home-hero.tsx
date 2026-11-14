import { ArrowUpRight, Mail } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SiteConfig } from "@/lib/content/schema";
import { site as defaultSite } from "@/lib/site";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Home page intro. Every value comes from lib/site.ts; `site` is a prop only for tests. */
export function HomeHero({ site = defaultSite }: { site?: SiteConfig }) {
  return (
    <section
      aria-labelledby="hero-name"
      className="flex flex-col gap-6 duration-700 animate-in fade-in slide-in-from-bottom-2 motion-reduce:animate-none"
    >
      <Image
        src={site.avatar}
        alt={`Portrait of ${site.name}`}
        width={112}
        height={112}
        preload
        className="size-24 rounded-full border object-cover sm:size-28"
      />

      <div className="flex flex-col gap-3">
        {site.openToWork && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-link" />
              Open to work
            </Badge>
            <span className="text-sm text-muted-foreground">{site.workStatus}</span>
          </div>
        )}
        <h1 id="hero-name" className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {site.name}
        </h1>
        <p className="text-xl font-medium">
          {site.headline}
          <span className="mt-1 block text-base font-normal text-muted-foreground">
            {site.headlineStack}
          </span>
        </p>
      </div>

      <p className="max-w-prose text-lg leading-relaxed text-muted-foreground">{site.bio}</p>

      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <a href={site.links.email}>
            <Mail aria-hidden="true" />
            Contact
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href={site.links.github} {...external}>
            GitHub
            <ArrowUpRight aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href={site.links.linkedin} {...external}>
            LinkedIn
            <ArrowUpRight aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </Button>
      </div>
    </section>
  );
}
