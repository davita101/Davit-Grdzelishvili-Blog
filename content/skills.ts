import type { SkillGroup } from "@/lib/content/schema";

/** Skill groups, in table order. Source: docs/about-me.md, Skills table. */
export const skills: SkillGroup[] = [
  { area: "Languages", items: ["TypeScript", "JavaScript", "Python"] },
  {
    area: "Frontend",
    items: [
      "React",
      "Next.js",
      "TanStack Query",
      "Zustand",
      "React Hook Form",
      "Zod",
      "Tailwind CSS",
      "shadcn/ui",
    ],
  },
  { area: "Backend", items: ["Node.js", "Express", "Django REST"] },
  { area: "Data", items: ["PostgreSQL", "Supabase", "Drizzle ORM", "MongoDB"] },
  { area: "Auth", items: ["Clerk"] },
  { area: "Testing / CI", items: ["Vitest", "Playwright", "GitHub CI"] },
  { area: "Deploy", items: ["Vercel", "Netlify"] },
  {
    area: "Other",
    items: ["AI agents", "code review", "mentoring", "team leadership"],
  },
];
