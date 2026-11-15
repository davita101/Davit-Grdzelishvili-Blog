import { ExternalLink, FolderGit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/content/schema";

type ProjectCardProps = Project & {
  /** Heading level of the name. Use "h3" when the card sits under an h2. */
  headingLevel?: "h2" | "h3";
};

const linkClass =
  "inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-link underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * A project in a grid: name, description, stack chips and its Repo / Live links.
 * Links are external, so they open in a new tab with rel="noopener noreferrer".
 */
export function ProjectCard({
  name,
  description,
  stack,
  repo,
  live,
  featured,
  headingLevel: Heading = "h2",
}: ProjectCardProps) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-lg border bg-card p-5 transition-[translate,box-shadow] duration-200 hover:shadow-card motion-safe:hover:-translate-y-0.5 focus-within:shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Heading className="text-lg font-semibold tracking-tight">{name}</Heading>
        {featured && <Badge variant="secondary">Featured</Badge>}
      </div>
      <p className="text-muted-foreground">{description}</p>
      <ul aria-label="Stack" className="flex flex-wrap gap-2">
        {stack.map((item) => (
          <li key={item} className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
            {item}
          </li>
        ))}
      </ul>
      {(repo || live) && (
        <div className="mt-auto flex flex-wrap gap-4 pt-1">
          {repo && (
            <a
              href={repo}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              <FolderGit2 aria-hidden="true" className="size-4" />
              Repo{" "}
              <span className="sr-only">for {name} (opens in a new tab)</span>
            </a>
          )}
          {live && (
            <a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              <ExternalLink aria-hidden="true" className="size-4" />
              Live{" "}
              <span className="sr-only">site for {name} (opens in a new tab)</span>
            </a>
          )}
        </div>
      )}
    </article>
  );
}
