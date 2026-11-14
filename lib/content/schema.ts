import { z } from "zod";

/**
 * Contract: zod schemas and types for all site content.
 * Import types from here; never redefine them elsewhere.
 * Changes need the lead's plan and the product owner's approval.
 */

/** A YYYY-MM-DD string that is a real calendar date. */
const isoDate = z.iso.date();

/**
 * A frontmatter date. YAML parses an unquoted `2026-01-31` as a Date, so we
 * accept a Date too and turn it back into the same YYYY-MM-DD string (UTC).
 */
export const DateString = z.union([
  isoDate,
  z.date().transform((d) => d.toISOString().slice(0, 10)),
]);

/** A YYYY-MM month, used for experience start and end dates. */
export const MonthString = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Expected a YYYY-MM month");

/** A site-relative path such as "/posts/my-post/cover.png". */
const SitePath = z.string().startsWith("/", "Must start with \"/\"");

/** Lowercase kebab-case, used for post slugs. */
export const Slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case");

export const Tag = z
  .string()
  .trim()
  .min(1, "Tag can't be empty")
  .refine((t) => t === t.toLowerCase(), "Tags must be lowercase");

// --- Posts (project.md §5.1) ---

export const PostFrontmatter = z.strictObject({
  title: z.string().trim().min(1).max(90),
  description: z.string().trim().min(1).max(200),
  date: DateString,
  updated: DateString.optional(),
  tags: z.array(Tag).min(1, "At least 1 tag").max(5, "At most 5 tags"),
  draft: z.boolean().optional(),
  cover: SitePath.optional(),
});
export type PostFrontmatter = z.infer<typeof PostFrontmatter>;

export const Heading = z.object({
  depth: z.union([z.literal(2), z.literal(3)]),
  text: z.string().min(1),
  id: z.string().min(1),
});
export type Heading = z.infer<typeof Heading>;

/** A post: frontmatter plus the fields derived at build time. */
export const Post = PostFrontmatter.extend({
  slug: Slug,
  /** Minutes at 200 wpm, rounded up. */
  readingTime: z.number().int().positive(),
  headings: z.array(Heading),
});
export type Post = z.infer<typeof Post>;

// --- Site data (project.md §5.2) ---

export const Project = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
  repo: z.url().optional(),
  live: z.url().optional(),
  featured: z.boolean(),
});
export type Project = z.infer<typeof Project>;

const MonthOrPresent = z.union([MonthString, z.literal("present")]);

export const ExperienceRole = z.object({
  title: z.string().min(1),
  start: MonthString,
  end: MonthOrPresent,
  bullets: z.array(z.string().min(1)),
});
export type ExperienceRole = z.infer<typeof ExperienceRole>;

export const ExperienceEntry = z.object({
  company: z.string().min(1),
  /** e.g. "Full-time" */
  employmentType: z.string().min(1),
  /** e.g. "Tbilisi, Remote" */
  location: z.string().min(1),
  start: MonthString,
  end: MonthOrPresent,
  roles: z.array(ExperienceRole).min(1),
});
export type ExperienceEntry = z.infer<typeof ExperienceEntry>;

export const SkillGroup = z.object({
  area: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});
export type SkillGroup = z.infer<typeof SkillGroup>;

// --- Site config (lib/site.ts) ---

export const NavItem = z.object({
  label: z.string().min(1),
  href: SitePath,
});
export type NavItem = z.infer<typeof NavItem>;

export const SiteConfig = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  headlineStack: z.string().min(1),
  bio: z.string().min(1),
  location: z.string().min(1),
  openToWork: z.boolean(),
  workStatus: z.string().min(1),
  email: z.email(),
  links: z.object({
    github: z.url(),
    linkedin: z.url(),
    email: z.string().startsWith("mailto:"),
  }),
  nav: z.array(NavItem).min(1),
  /** Absolute site URL with no trailing slash. */
  url: z.url().refine((u) => !u.endsWith("/"), "No trailing slash"),
  avatar: SitePath,
});
export type SiteConfig = z.infer<typeof SiteConfig>;
