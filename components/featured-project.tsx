import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { projects as defaultProjects } from "@/content/projects";
import type { Project } from "@/lib/content/schema";

/** The first featured project, under Latest posts on home. Hidden when none is featured. */
export function FeaturedProject({ projects = defaultProjects }: { projects?: Project[] }) {
  const project = projects.find((p) => p.featured);
  if (!project) return null;

  return (
    <section aria-labelledby="featured-project-heading" className="mt-16 sm:mt-24">
      <h2 id="featured-project-heading" className="text-2xl font-semibold tracking-tight">
        Featured project
      </h2>
      <div className="mt-6">
        <ProjectCard {...project} headingLevel="h3" />
      </div>
      <Link
        href="/projects"
        className="mt-6 inline-block rounded-sm text-sm font-medium text-link underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        All projects
      </Link>
    </section>
  );
}
