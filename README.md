# Davit Grdzelishvili — Portfolio & Blog

[![Personal Blog CI](https://github.com/davita101/Davit-Grdzelishvili-Blog/actions/workflows/ci.yml/badge.svg)](https://github.com/davita101/Davit-Grdzelishvili-Blog/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Personal portfolio and blog: MDX posts, projects and an about page. Static, fast, and built end to end by a small team of AI agents with a human product owner.
**Live:** https://davit-grdzelishvili-blog.vercel.app

## Features

- **MDX posts** with syntax-highlighted code (Shiki via rehype-pretty-code), file name labels and a copy button
- **Sticky table of contents** on wide screens, with the heading in view highlighted
- **Tags**, with a page per tag
- **RSS feed** (`/rss.xml`), **sitemap** and `robots.txt`
- **Open Graph images** generated for the site and for each post
- **Dark and light theme**, following the system setting, with a toggle
- **Static generation** for every page
- **Security headers** (CSP and friends) on every route
- **Drafts** visible in dev and previews, hidden from production pages, RSS and sitemap
- **Cookieless analytics** with PostHog (EU host, in-memory persistence: no cookies, no localStorage). Off unless a key is set.

## Tech stack

| Area | Tool |
|---|---|
| Framework | Next.js 16.4 (App Router), React 19.3 |
| Language | TypeScript 5 (`strict`) |
| Styling | Tailwind CSS 4.3, shadcn/ui primitives |
| Content | MDX via next-mdx-remote 6, frontmatter validated with Zod 4 |
| Code highlighting | rehype-pretty-code 0.14 + Shiki 4 |
| Tests | Vitest 5 + Testing Library |
| Analytics | PostHog (posthog-js) |
| Hosting | Vercel |

## How it was built

This site was built by a team of AI agents run from JSM HQ:

| Role | Who | Does |
|---|---|---|
| Lead | Daviti (agent) | Plans each phase, writes the tasks, reviews PRs |
| Developer | Giorgi (agent) | Builds each task on its own branch and opens the PR |
| Product owner | Davit (human) | Approves plans and contract changes, reviews, merges and deploys |

The work followed the phases in [`docs/plan.md`](docs/plan.md), in order:

0. Setup
1. Foundation
2. Blog engine
3. Portfolio pages
4. SEO + analytics
5. Polish + launch

Every task is one branch and one pull request. Each PR runs CI (typecheck, lint, tests, build) and gets a Vercel preview. Nothing reaches production until the product owner merges it and promotes the build. The team rules are in [`CLAUDE.md`](CLAUDE.md).

## Project structure

```
app/          Routes: home, blog, posts, tags, projects, about, RSS, sitemap, OG images
components/   UI components (shadcn primitives in components/ui, MDX parts in components/mdx)
content/
  posts/      Blog posts, one .mdx file per post
  *.ts        Site data: projects, experience, skills
lib/          Content loader and schema, MDX rendering, RSS, SEO, analytics, site config
docs/         Project spec, build plan, owner facts
public/       Images and fonts
```

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. Copy `.env.example` to `.env.local` if you need to set variables. None are required to build.

| Variable | Used for |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL. Set for Production only. |
| `NEXT_PUBLIC_POSTHOG_KEY` | Turns analytics on. Leave empty to keep it off. |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host. Defaults to the EU host. |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Lets agents read protected previews. Never commit it. |

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Run the app locally |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Run the Vitest suite once (`vitest run`) |

## Writing a post

Add `content/posts/<slug>.mdx`. The file name is the slug: lowercase, kebab-case.

```mdx
---
title: My post
description: One or two sentences for the list, meta description and OG image.
date: 2026-11-16
tags: [nextjs, typescript]
draft: true
---

## First heading

Post body in MDX.
```

| Field | Required | Notes |
|---|---|---|
| `title` | yes | ≤ 90 chars |
| `description` | yes | ≤ 200 chars |
| `date` | yes | `YYYY-MM-DD` |
| `updated` | no | `YYYY-MM-DD`, shown as "Updated …" |
| `tags` | yes | Lowercase, 1–5 tags |
| `draft` | no | `true` hides the post in production |
| `cover` | no | Path under `public/`, e.g. `/posts/my-post/cover.png` |

Invalid frontmatter fails the build with the file name and field. Reading time and headings are derived at build time. The full content model is in `docs/project.md` §5.1.

## Deployments

Hosted on Vercel.

| Environment | Source | Who deploys |
|---|---|---|
| Preview | Every pull request | Automatic. Vercel builds each PR push. |
| Production | `main` | Product owner only. Merges to `main`, then promotes the build. Automatic promotion is off. |

### Reading a preview (agents)

1. Wait until the `Vercel` status check on the PR succeeds (`gh pr checks <n>`).
2. Get the preview URL from the Vercel bot comment on the PR (`gh pr view <n> --comments`, the **Preview** link). Never build it from the branch name: Vercel shortens long names. This repo's Vercel integration does not create GitHub deployments, so the deployments API returns nothing, and the `Vercel` status links to the dashboard, not the preview.
3. Previews are protected. Send the bypass header on every request. The value comes from the `VERCEL_AUTOMATION_BYPASS_SECRET` environment variable; never paste it anywhere.

   ```bash
   curl -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" https://<preview-url>/
   ```

   For browser tests, also send `x-vercel-set-bypass-cookie: true` on the first request.
4. Check at 375 px and desktop width, in dark and light theme.

## Docs

- [`docs/project.md`](docs/project.md): what we build (stack, content model, security rules, design)
- [`docs/plan.md`](docs/plan.md): the phases, in build order
- [`docs/about-me.md`](docs/about-me.md): owner facts
- [`CLAUDE.md`](CLAUDE.md): team rules

## License

[MIT](LICENSE)
