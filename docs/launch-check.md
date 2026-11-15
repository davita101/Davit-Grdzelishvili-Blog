# Pre-launch check (core flow)

Run on **2026-11-15**, against production: https://davit-grdzelishvili-blog.vercel.app

| | |
|---|---|
| Deployment | `dpl_5B651L3B7Q6nyQeYDvkkTxhKGXkn` (`target production`, status Ready, created 2026-11-15 12:20:19 UTC) |
| Commit | `0629392` (Merge #38): the latest `main`. Vercel's GitHub status for this commit links to the same deployment id. |
| Published posts | 0 (both posts in `content/posts` are drafts) |
| Viewports | 375 px and 1280 px, light and dark theme (4 runs per step) |
| Tool | Playwright + Chromium with a normal desktop Chrome user agent (PostHog drops headless/webdriver traffic) |

Steps come from `docs/project.md` §2. Steps 4 and 8 need a published post, and T04 fills them in after the owner's first post.

## Core flow

| # | Step | Result | Evidence |
|---|---|---|---|
| 1 | Open `/`: avatar, name, headline, short bio, latest posts, featured project | **Pass** (empty state) | Avatar loads (alt "Portrait of Davit Grdzelishvili"). The h1 is the name, and the headline and bio match `docs/about-me.md`. "Latest posts" shows the designed empty state, "No posts yet. Check back soon.", because there are 0 posts. Featured project: Dashboard Constructor. 4/4 viewport and theme runs. Screenshots `flow-1-home-{light,dark}-{375,1280}.png`. |
| 2 | Click **Blog**: all published posts, newest first | **Pass** (empty state) | Reached by clicking Blog in the header (mobile menu at 375 px). `/blog` shows the h1 "Blog" and the empty state "No posts yet. Check back soon.", with no "0 posts" line. 4/4. Screenshots `flow-2-blog-*.png`. |
| 3 | Click a tag: only posts with that tag | **Pass** (empty/404 part). **Full check waits for first post.** | With 0 posts there are no tag chips on `/blog` (0 tag links, 4/4). Every tag URL is a 404 by design (#38): `/blog/tags/mdx`, `/blog/tags/nextjs` and `/blog/tags/sample` all return HTTP 404 (12/12). |
| 4 | Open a post: highlighted code, heading anchors, title and OG image | **Waits for first post** | T04 |
| 5 | Open `/projects`: description, stack, repo and live links | **Pass** | Reached by clicking Projects in the header. 1 card, Dashboard Constructor. The description and all 8 stack chips match `docs/about-me.md`. Repo → `https://github.com/davita101/dashboard-constructor`, Live → `https://dashboard-constructor.vercel.app`. 4/4. Screenshots `flow-5-projects-*.png`. |
| 6 | Open `/about`: experience timeline and skills match `docs/about-me.md` | **Pass** | Reached by clicking About. The timeline shows Goal-Oriented Academy (GOA) with both roles: Full-Stack Web Development Mentor (Jun 2024 – Present) and Development Team Lead (May 2023 – Present). All 28 skills from the about-me Skills table are present. No Education section or "degree", per the display rule. 4/4. Screenshots `flow-6-about-*.png`. |
| 7 | Click LinkedIn / GitHub / email: each opens the right place | **Pass** | Footer GitHub opens a new tab at `https://github.com/davita101`. LinkedIn opens a new tab at `https://www.linkedin.com/in/davit-grdzelishvili/`. Both have `window.opener === null` (8/8). Email is a `mailto:` link with the address from `docs/about-me.md` (compared separately). Note: my sandbox blocks github.com and linkedin.com, so the new tabs were answered with a stub page. The check covers the URL each tab opened, not the external site loading. |
| 8 | Add a new `.mdx`, push, merge: post is live, in the list, RSS and sitemap | **Waits for first post** | T04 |
| 9 | Toggle dark/light: the choice persists on reload | **Pass** | Clicking "Toggle theme" flips the `dark` class on `<html>`, and it is still flipped after a reload. Checked in both directions (from light and from dark), 4/4. |
| 10 | PostHog shows the page views from steps 1–7 | **Pass** | Project 737682 (US), `$pageview` events on the production URL from this run (13:07–13:09 UTC): `/` 8, `/about` 8, `/blog` 4, `/projects` 4. That matches the visits: `/` twice per run, `/about` once plus the step 9 reload per run. Query: `SELECT properties.$pathname, count() FROM events WHERE event = '$pageview' AND timestamp BETWEEN '2026-11-15 13:07' AND '2026-11-15 13:30' AND properties.$current_url LIKE 'https://davit-grdzelishvili-blog.vercel.app%' GROUP BY 1`. |

No page errors during the run. The only console errors were the three expected 404 document loads from step 3 in each run.

## Lighthouse on production `/`

Lighthouse 12.8.2, median of 5 runs. `noindex` is off on production, so SEO is scored.

| Preset | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Mobile | **95** (runs 96, 94, 95, 96, 86) | 100 | 100 | 100 |
| Desktop | **99** (runs 100, 100, 98, 99, 98) | 100 | 100 | 100 |

All four categories are ≥ 95 on both presets. Mobile Performance sits right at the line:

- The 86 run had a 520 ms TBT spike from CPU load in the test sandbox; the other runs had 160–220 ms.
- One run showed CLS 0.033, under the 0.1 "good" threshold. The others had 0.

The screenshots and raw Lighthouse JSON are in the checker's sandbox and aren't committed.
