# Project: Davit Grdzelishvili — Portfolio Blog

A personal site for Davit: a blog (MDX posts), a projects showcase, and an about page with experience and skills. Its job is to show recruiters and developers who Davit is and what he builds, and give him a place to write.

This file is the source of truth for **what** we build. `docs/plan.md` says **in what order**. `docs/about-me.md` holds every personal fact. Tasks, owners and status live in JSM HQ.

---

## 1. Users

| User | What they do | Where |
|---|---|---|
| **Owner** (Davit) | Writes posts as `.mdx` files, edits `about-me` data, pushes to GitHub | Repo |
| **Recruiter** | Reads about, experience, projects; contacts Davit | `/`, `/about`, `/projects` |
| **Reader** | Reads posts, browses tags, subscribes via RSS | `/blog`, `/blog/[slug]`, `/rss.xml` |

---

## 2. Core flow

When this works end to end on production, the site is done.

1. Open `/`. See avatar, name, headline, short bio, latest posts, featured project.
2. Click **Blog**. See all published posts, newest first, with date, reading time, tags.
3. Click a tag. Only posts with that tag show.
4. Open a post. Code blocks are highlighted, headings have anchor links, title and OG image are correct when the link is shared.
5. Open `/projects`. Each project shows description, stack, repo and live links.
6. Open `/about`. Experience timeline and skills match `docs/about-me.md`.
7. Click LinkedIn / GitHub / email. Each opens the right place.
8. Add a new `.mdx` file, push, merge. After deploy the post is live, in the list, in `/rss.xml` and `/sitemap.xml`.
9. Toggle dark/light. The choice persists on reload.
10. PostHog shows the page views from steps 1–7.

---

## 3. Stack

| Layer | Tool | Notes |
|---|---|---|
| App | Next.js (App Router) + TypeScript `strict` | Static by default. Every page is prerendered at build time. |
| Styling | Tailwind CSS + shadcn/ui | Tokens in `app/globals.css`. Components in `components/ui`. |
| Content | MDX files in `content/posts` | Frontmatter parsed with `gray-matter`, validated with zod. Rendered with `next-mdx-remote/rsc`. |
| Code highlighting | `rehype-pretty-code` (Shiki) | Build-time, no client JS. |
| MDX plugins | `remark-gfm`, `rehype-slug`, `rehype-autolink-headings` | Tables, heading anchors. |
| Theme | `next-themes` | Dark / light / system, no flash on load. |
| OG images | `next/og` (`ImageResponse`) | One generated image per post plus a default. |
| Analytics | PostHog | Page views and post-read events. Cookieless mode (no consent banner). |
| Tests | Vitest (+ Testing Library for components) | Content loader, schema, utils, key components. |
| Hosting | Vercel | Preview per PR; production from `main`. |
| Package manager | pnpm | |

**Constraint:** free tiers only. No database, no auth, no paid service. Adding any backend service needs the product owner's approval.

---

## 4. Environments

| Environment | What it is | Who deploys |
|---|---|---|
| Production | Vercel production from `main` | Product owner only: merges to `main`, promotes the build |
| Preview | Vercel preview per PR | Automatic |
| Local | `pnpm dev` | Developer |

PostHog: one project. Preview and local send events only if `NEXT_PUBLIC_POSTHOG_KEY` is set; leave it unset locally.

---

## 5. Content model

### 5.1 Post (`content/posts/<slug>.mdx`)

The file name is the slug: lowercase, kebab-case.

| Frontmatter | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | ≤ 90 chars |
| `description` | string | yes | ≤ 200 chars. Used in list, meta description, OG. |
| `date` | `YYYY-MM-DD` | yes | Publish date |
| `updated` | `YYYY-MM-DD` | no | Shown as "Updated …" |
| `tags` | string[] | yes | Lowercase, 1–5 tags |
| `draft` | boolean | no | `true` = hidden in production builds, visible in dev and previews |
| `cover` | string | no | Path under `public/`, e.g. `/posts/my-post/cover.png` |

Derived at build time: `slug`, `readingTime` (minutes, 200 wpm), `headings` (for table of contents).

An invalid frontmatter fails the build with the file name and field.

### 5.2 Site data

| File | Holds | Source |
|---|---|---|
| `lib/site.ts` | Name, headline, bio, location, links, nav items, `SITE_URL` | `docs/about-me.md` |
| `content/experience.ts` | Experience entries | `docs/about-me.md` |
| `content/projects.ts` | Projects | `docs/about-me.md` |
| `content/skills.ts` | Skill groups | `docs/about-me.md` |

Types and zod schemas for all of the above live in `lib/content/schema.ts`. That file plus `lib/site.ts` are the **contract** (see `CLAUDE.md`).

Images: post images in `public/posts/<slug>/`. Avatar: `public/avatar.jpg` (400×400).

---

## 6. Features

### 6.1 Layout

- Header: name (links home), nav (Blog, Projects, About), theme toggle. Mobile: menu sheet.
- Footer: GitHub, LinkedIn, email, RSS links, © year.
- Skip-to-content link. Max content width ~ 720 px for reading, wider for grids.

### 6.2 Home (`/`)

- Hero: avatar, name, headline, 2-sentence bio, "Open to work" badge, buttons: Contact, GitHub, LinkedIn.
- Latest 3 posts.
- Featured project card.

### 6.3 Blog list (`/blog`)

- All published posts, newest first: title, date, reading time, tags, description.
- Tag filter: `/blog/tags/[tag]` (static pages), tag chips link there.
- Empty state when no posts.

### 6.4 Post (`/blog/[slug]`)

- Title, date, updated date, reading time, tags, optional cover.
- MDX body: highlighted code with copy button, heading anchors, GFM tables, images via `next/image`.
- Table of contents on wide screens (from `h2`/`h3`).
- Previous / next post links.
- `generateStaticParams` for every published post. Unknown slug → 404.
- Metadata: title, description, canonical URL, OG + Twitter image.

### 6.5 Projects (`/projects`)

- Grid of cards from `content/projects.ts`: name, description, stack chips, repo + live links, `featured` flag.

### 6.6 About (`/about`)

- Longer bio, avatar.
- Experience timeline from `content/experience.ts`.
- Skills grouped from `content/skills.ts`.
- Contact block: email (mailto), LinkedIn, GitHub.

### 6.7 Feeds and SEO

- `/rss.xml`: published posts, full title + description + link.
- `/sitemap.xml` (`app/sitemap.ts`), `/robots.txt` (`app/robots.ts`).
- Default metadata in root layout using `lib/site.ts`. JSON-LD `Person` on home, `BlogPosting` on posts.
- OG images: `/opengraph-image` default, `/blog/[slug]/opengraph-image` per post.

### 6.8 Analytics

- PostHog via a client provider in the root layout, cookieless (`persistence: "memory"`).
- Events: `$pageview` (App Router aware), `post_read` (scrolled 75 % of a post, props: `slug`), `outbound_click` (props: `href`).
- Disabled when the key is unset.

### 6.9 Not found

- Custom 404 with links to Home and Blog.

---

## 7. Security rules

Every PR must follow these.

| Risk | Rule |
|---|---|
| Secrets | No secret in `NEXT_PUBLIC_*`, client code or a commit. Never remove `.env` from `.gitignore`. Only public keys exist in this project. |
| MDX | Only the owner's files in `content/` are compiled. Never compile MDX from a URL, query or user input. |
| External links | `target="_blank"` always with `rel="noopener noreferrer"`. |
| Headers | `next.config` sets `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `frame-ancestors 'self'`, and a CSP allowing self + PostHog host. |
| Privacy | PostHog cookieless; no personal data in events. |
| Drafts | `draft: true` posts never appear in production pages, RSS or sitemap. |

---

## 8. Repo layout

```
app/
  layout.tsx, page.tsx          # root layout + home
  blog/page.tsx                 # list
  blog/[slug]/page.tsx          # post (+ opengraph-image.tsx)
  blog/tags/[tag]/page.tsx
  projects/page.tsx
  about/page.tsx
  rss.xml/route.ts, sitemap.ts, robots.ts, not-found.tsx
components/
  ui/                           # shadcn
  ...                           # site components
content/
  posts/*.mdx
  projects.ts, experience.ts, skills.ts
lib/
  site.ts                       # contract: site config
  content/schema.ts             # contract: zod schemas + types
  content/posts.ts              # loader: read, validate, sort, filter drafts
  mdx.tsx                       # MDX components + plugins
public/
  avatar.jpg, posts/<slug>/...
docs/
  project.md, plan.md, about-me.md
```

Single Next.js app. No monorepo.

---

## 9. Environment variables

| Variable | Used by | Public? |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Metadata, sitemap, RSS, OG | Yes |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | Analytics | Yes |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Agents checking previews (never in app code) | No |

`.env.example` lists every variable with no values.

---

## 10. Out of scope

| Feature | Reason |
|---|---|
| Database, auth, admin editor | Posts are MDX in the repo |
| Comments, likes | Needs auth + DB |
| Newsletter, contact form | Needs email service; mailto is enough |
| i18n (Georgian version) | Later, if wanted |
| Search | Few posts; tags are enough |

---

## 11. Design

Every page follows this. Agents don't pick their own style.

| Area | Look |
|---|---|
| Overall | Minimal, monochrome (black / white / zinc), one accent color for links and focus |
| Type | Geist Sans for UI, Geist Mono for code; body 17–18 px, line height ~1.7 on posts |
| Theme | Dark and light, system default, toggle in header |
| Motion | Subtle only: fade-in on load, hover lift on cards. Respect `prefers-reduced-motion`. |
| Tokens | One set of tokens (colors, radius, shadows) in `globals.css`, used by every page |
| Code blocks | Shiki dual theme (github-light / github-dark), copy button, file name label optional |
| States | Empty and 404 states designed |
| Responsive | Works down to 375 px wide |
| Accessibility | WCAG AA contrast, visible focus, alt text on every image, semantic headings |
| Performance | Lighthouse ≥ 95 on Performance, Accessibility, Best Practices, SEO for `/` and a post |
