# Plan

The build order for Davit's portfolio blog. `docs/project.md` describes each feature in detail.

## Rules

- Build phases in this order. Don't add, remove, or reorder phases.
- One developer (Giorgi), so every phase has one lane. Tasks in a phase run in order, by `needs`.
- Each phase is one board in JSM HQ. The lead (Daviti) creates the board and its tasks with the product owner before the phase starts. The next phase can be broken down while the current one is being built.
- Tasks and their status live only in JSM HQ. This file never lists tasks.
- A phase is done when all its tasks are merged and its "Done when" checks pass on the latest Vercel preview. Production goes live only once, in Phase 5.
- Each phase lists the keys it needs. When an agent reaches a step that needs one, it stops and asks (see `CLAUDE.md`). Agents never create accounts or handle raw keys in chat.
- Keep JSM HQ's "Export plan to docs/plan.md" off. It would overwrite this file.

---

## Phase 0 — Setup

**Goal:** an empty app that builds and deploys.

**Keys needed:** none at the start. The product owner connects Vercel during this phase, before its last task: imports the repo (automatic promotion off), allows `*.vercel.app` in Giorgi's sandbox, and adds `VERCEL_AUTOMATION_BYPASS_SECRET` to Giorgi's env file. The lead plans the Vercel check as the last task.

| Includes | project.md |
|---|---|
| Next.js app (App Router, TypeScript strict, Tailwind, ESLint), pnpm | §3, §8 |
| shadcn/ui init, Vitest set up with one passing test | §3 |
| `pnpm typecheck`, `lint`, `test`, `build` scripts | — |
| `.env.example` with every variable | §9 |
| Vercel project: preview per PR, production from `main` | §4 |

**Done when:** a PR gets a Vercel preview URL and the home page loads on it; all four checks pass.

---

## Phase 1 — Foundation

**Goal:** the contract, design system and site shell.

**Keys needed:** none.

| Includes | project.md |
|---|---|
| `lib/site.ts` and `lib/content/schema.ts` (contract), filled from `docs/about-me.md` | §5 |
| Design tokens, fonts, dark/light theme with toggle | §11, §6.1 |
| Header (nav, mobile menu), footer, skip link, 404 page | §6.1, §6.9 |
| Home page hero with avatar, bio, links (no posts yet) | §6.2 |
| Security headers in `next.config` | §7 |

**Done when:** on the preview, the home hero shows correct data from `about-me.md`; theme toggle persists on reload; nav works on 375 px; unknown URL shows the 404.

---

## Phase 2 — Blog engine

**Goal:** MDX posts render beautifully and are listed.

**Keys needed:** none.

| Includes | project.md |
|---|---|
| Post loader: read `content/posts`, validate frontmatter, reading time, headings, drafts hidden in production | §5.1 |
| MDX rendering: code highlighting + copy button, heading anchors, GFM, images | §6.4 |
| `/blog` list, `/blog/tags/[tag]`, `/blog/[slug]` with TOC and prev/next | §6.3, §6.4 |
| Latest posts on home | §6.2 |
| 2 sample posts (marked `draft: true`) to exercise every MDX feature | §5.1 |

**Done when:** on the preview, both sample posts render with highlighted code and anchors; tag pages filter correctly; a post with bad frontmatter fails `pnpm build` with a clear message; loader has unit tests.

---

## Phase 3 — Portfolio pages

**Goal:** recruiters see who Davit is and what he built.

**Keys needed:** none.

| Includes | project.md |
|---|---|
| `content/projects.ts`, `experience.ts`, `skills.ts` from `docs/about-me.md` | §5.2 |
| `/projects` grid, featured project on home | §6.5, §6.2 |
| `/about`: bio, experience timeline, skills, contact block | §6.6 |

**Done when:** every fact on `/about` and `/projects` matches `docs/about-me.md`; all links open the right place; pages pass at 375 px.

---

## Phase 4 — SEO + analytics

**Goal:** the site is shareable, indexable and measured.

**Keys needed:** `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` (product owner creates the PostHog project and adds them to Vercel Preview + Production). `NEXT_PUBLIC_SITE_URL`.

| Includes | project.md |
|---|---|
| Metadata, canonical URLs, JSON-LD, OG images (default + per post) | §6.7 |
| `/rss.xml`, `/sitemap.xml`, `/robots.txt` | §6.7 |
| PostHog provider, `$pageview`, `post_read`, `outbound_click` | §6.8 |

**Done when:** sharing a post URL in a link preview tool shows its title and OG image; RSS and sitemap validate and exclude drafts; PostHog shows page views from the preview.

---

## Phase 5 — Polish + launch

**Goal:** fast, accessible, live.

**Keys needed:** the product owner sets production env vars on Vercel (and a custom domain, if any).

| Includes | project.md |
|---|---|
| Lighthouse ≥ 95 on `/` and one post; fix findings | §11 |
| Accessibility pass (contrast, focus, alt text, headings) | §11 |
| Final pass on every rule in §7; empty states; motion respects reduced-motion | §7, §11 |
| First real post (owner writes it; dev checks it renders) | §5.1 |

**Done when:** the product owner promotes the build; all ten steps of the core flow (§2) pass on the production URL.
