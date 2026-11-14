# Davit's Portfolio Blog — Team Rules

A personal portfolio and blog for Davit Grdzelishvili: MDX posts, projects, about page. A team of agents builds it, run from JSM HQ: **Daviti** (lead, plans) and **Giorgi** (developer, builds). Every agent follows this file. JSM HQ adds your role, the team, the workflow rules and your tools when your session starts.

## Docs

| File | Read it for |
|---|---|
| `docs/project.md` | What we build: pages, content model, stack, security rules, design |
| `docs/plan.md` | The phases, in build order (human-written) |
| `docs/about-me.md` | Owner's bio, experience, skills, projects, links. The only source for personal facts. |

Your task (from `get_my_task`) lists the `project.md` sections it needs. Read those, not the whole file.

## How to talk to the product owner

- Lead with the answer or result. No preamble, no recap at the end.
- Short sentences, plain words. No paragraph over 3 sentences.
- A table for comparisons, a numbered list for steps. Plain text for a short answer.
- Need a decision? Use the AskUserQuestion tool: 2–4 options, recommended first, marked "(Recommended)", one line on why each.
- One decision at a time unless they're linked. Never more than 3.
- Say what you know vs. what you're guessing.

## Before you open a PR

- Run all checks (see Commands). All must pass.
- PR body: what changed, how you tested, and the task's done-when list with each item checked or explained.
- Vercel deploys a preview of every PR. Check your change on it, and put the preview URL in the PR. If the repo isn't connected to Vercel yet (early Phase 0), say so in the PR and skip this check.

## Checking your change on a Vercel preview

- Get the preview URL from GitHub, never from the branch name (Vercel shortens long names): the Vercel comment on your PR (`gh pr view <n> --comments`), or the PR's deployment status (`gh api repos/<owner>/<repo>/deployments?ref=<branch>`). Wait until the deployment succeeds.
- Previews are protected. Send the header `x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET` on every request. For browser tests, also send `x-vercel-set-bypass-cookie: true` on the first request.
- If a preview URL is blocked by your sandbox, call `request_access` for `*.vercel.app` (all previews) rather than the single URL.
- Check at 375 px and desktop width, in dark and light theme.

## When you must stop and ask

| Situation | Do |
|---|---|
| You need to change `lib/site.ts` or `lib/content/schema.ts` (the contract), or the post frontmatter fields | Stop. That's a contract change. The lead plans it; the product owner approves it. |
| You need a personal fact (job, date, project, link) that isn't in `docs/about-me.md` | Stop. Ask. Never invent or guess personal facts. |
| You want to add a backend service, database, auth or paid tool | Stop. Out of scope (`project.md` §10) unless the product owner approves. |
| The task is unclear or conflicts with `project.md` | Stop. Ask. Don't guess. |
| You need an account, a key, or a sign-in | Stop. Say exactly what you need and where it goes (e.g. your env file). Accounts and sign-ins are the product owner's job. |

## Reviews and your next task

- Fix every valid review comment (product owner, lead, CodeRabbit if enabled) on the same branch. If a comment is wrong, reply on the PR with the reason. Answer every thread.
- Once your PR is open, the lead may give you your next task. Take it on a new branch from `main`.
- When review comments arrive on an earlier PR, switch back to that branch, fix, push, and return. Don't call `set_my_status` for the earlier task: it would update your current one. HQ tracks the earlier PR by itself.
- Never start a task that needs code from one of your open PRs. If nothing independent is ready, say so.
- Never merge your own PR, never push to `main`, never force-push a branch under review.

## Content rules

- Posts are `.mdx` files in `content/posts`, file name = slug. Frontmatter follows `project.md` §5.1 and is validated at build.
- Never write or edit a real (non-draft) post's text. Posts are the owner's voice. Sample/test posts are `draft: true`.
- Site data (`content/projects.ts`, `experience.ts`, `skills.ts`, `lib/site.ts`) comes from `docs/about-me.md` only.
- Images go in `public/`, rendered with `next/image`, with alt text.

## Security rules

`docs/project.md` §7 lists every rule. The ones you must never break:

- No secret in `NEXT_PUBLIC_*`, client code, or a commit. Never remove `.env` from `.gitignore`.
- Only compile MDX from files in `content/`. Never from a URL or user input.
- External links open with `rel="noopener noreferrer"`.
- Drafts never reach production pages, RSS or sitemap.

## Code conventions

| Area | Rule |
|---|---|
| Types | TypeScript `strict`. No `any`. Import content types from `lib/content/schema.ts`; never redefine them. |
| Rendering | Server Components and static generation by default. `"use client"` only where needed (theme toggle, copy button, analytics, mobile menu). |
| Tests | Vitest. At least one test per pure function and per content loader. Components with logic get a Testing Library test. |
| New dependency | Allowed. Name it and the reason in the PR body. |
| UI | Follow `project.md` §11 Design. Reuse components in `components/`; shadcn primitives in `components/ui`. |
| Site name and links | From `lib/site.ts`. Never hardcode the name, email or URLs. |

## Commands

| Command | Does |
|---|---|
| `pnpm dev` | Run the app locally |
| `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` | Checks. All must pass before a PR. |
