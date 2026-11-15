import type { Project } from "@/lib/content/schema";

/** Projects. Source: docs/about-me.md, Projects table. */
export const projects: Project[] = [
  {
    name: "Dashboard Constructor",
    description:
      "Full-stack SaaS dashboard builder: drag-and-drop widgets, projects, charts, auth, one-click demo account",
    stack: [
      "Next.js 16",
      "TypeScript",
      "Supabase/Postgres",
      "Drizzle ORM",
      "Clerk",
      "Vitest",
      "Playwright",
      "CI",
    ],
    repo: "https://github.com/davita101/dashboard-constructor",
    live: "https://dashboard-constructor.vercel.app",
    featured: true,
  },
];
