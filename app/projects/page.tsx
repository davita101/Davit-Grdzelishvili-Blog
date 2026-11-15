import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/content/projects";
import { SITE_URL, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Projects",
  description: `Projects by ${site.name}.`,
  alternates: { canonical: `${SITE_URL}/projects` },
};

export default function ProjectsPage() {
  // Featured first; sort is stable, so the file order holds within each group.
  const sorted = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured));
  return (
    <div className="mx-auto max-w-wide px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Projects</h1>
      <p className="mt-2 text-muted-foreground">Things I&apos;ve built.</p>
      <div className="mt-8">
        {sorted.length === 0 ? (
          <div
            role="status"
            className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center"
          >
            <FolderOpen aria-hidden="true" className="size-8 text-muted-foreground" />
            <p className="text-muted-foreground">No projects yet. Check back soon.</p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((project) => (
              <li key={project.name}>
                <ProjectCard {...project} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
