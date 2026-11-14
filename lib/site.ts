import { SiteConfig } from "@/lib/content/schema";

/**
 * Contract: site config. Every value comes from docs/about-me.md.
 * Changes need the lead's plan and the product owner's approval.
 */

const FALLBACK_SITE_URL = "http://localhost:3000";

/** Uses the fallback when the value is unset or blank, and strips trailing slashes. */
export function resolveSiteUrl(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return FALLBACK_SITE_URL;
  return value.replace(/\/+$/, "");
}

export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

const email = "grdzelishvilidaviti@gmail.com";

export const site: SiteConfig = SiteConfig.parse({
  name: "Davit Grdzelishvili",
  headline: "Full-Stack Developer",
  // Short form of the LinkedIn headline, approved by the product owner on 2026-11-14.
  headlineStack: "React · Next.js · TypeScript · Node.js · AI Agents",
  bio: "Full-Stack Developer focused on React, Next.js, TanStack and TypeScript. Development Team Lead & Web Development Mentor at Goal-Oriented Academy (3.5+ years).",
  location: "Tbilisi, Georgia",
  openToWork: true,
  workStatus: "Open to Frontend / Full-Stack roles: on-site, hybrid or remote",
  email,
  links: {
    github: "https://github.com/davita101",
    linkedin: "https://www.linkedin.com/in/davit-grdzelishvili/",
    email: `mailto:${email}`,
  },
  nav: [
    { label: "Blog", href: "/blog" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
  ],
  url: SITE_URL,
  avatar: "/avatar.jpg",
} satisfies SiteConfig);
