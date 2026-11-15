import type { ExperienceEntry } from "@/lib/content/schema";

/** Experience, newest role first. Source: docs/about-me.md, Experience. */
export const experience: ExperienceEntry[] = [
  {
    company: "Goal-Oriented Academy (GOA)",
    employmentType: "Full-time",
    location: "Tbilisi, Remote",
    start: "2023-05",
    end: "present",
    roles: [
      {
        title: "Full-Stack Web Development Mentor",
        start: "2024-06",
        end: "present",
        bullets: [
          "Mentor student groups from programming fundamentals to deployed projects: HTML/CSS, JavaScript, TypeScript, React, Next.js, React libraries (TanStack Query, Zustand, React Hook Form, Zod), Node.js/Express, Python fundamentals and Django REST.",
          "Teach core concepts: variables, data structures, algorithms, async code, APIs, databases.",
          "Weekly code reviews; teach debugging, clean code and Git workflow (branches, pull requests).",
          "Help students build and deploy portfolio projects (Vercel, Netlify, GitHub).",
          "Explain complex topics simply and adapt material to each student's level.",
        ],
      },
      {
        title: "Development Team Lead",
        start: "2023-05",
        end: "present",
        bullets: [
          "Lead a student dev team building real web projects with React, Next.js, TypeScript, TanStack Query, Zustand, React Hook Form + Zod, Tailwind/shadcn, Node.js/Express.",
          "Run code reviews, set up the Git workflow, help the team debug.",
          "Plan tasks and deadlines; onboard new team members.",
        ],
      },
    ],
  },
];
