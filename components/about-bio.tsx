import type { SiteConfig } from "@/lib/content/schema";
import { site as defaultSite } from "@/lib/site";

/**
 * The longer /about bio. Every fact comes from docs/about-me.md; name, headline,
 * location and work status come from lib/site.ts. Education display rule
 * (approved 2026-11-15): the GOA course appears once, and is never called a degree.
 */
export function AboutBio({ site = defaultSite }: { site?: SiteConfig }) {
  return (
    <div className="flex flex-col gap-4 text-lg leading-relaxed text-muted-foreground">
      <p>
        {site.name} is a {site.headline} based in {site.location}, focused on React, Next.js, TanStack
        and TypeScript. Development Team Lead at Goal-Oriented Academy (GOA) since May 2023 and Full-Stack
        Web Development Mentor there since June 2024: leading a student dev team on real web projects, and
        mentoring student groups from programming fundamentals to deployed projects.
      </p>
      <p>
        Took the web development course at Goal-Oriented Academy from May to November 2023. Engages with
        the Georgian tech scene: Hacktoberfest Georgia, Devtherapy and the BTU AI hackathon.{" "}
        {site.workStatus}.
      </p>
    </div>
  );
}
