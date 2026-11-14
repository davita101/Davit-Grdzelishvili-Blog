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

- Wait until the `Vercel` check on your PR succeeds (`gh pr checks <n>`). Then take the preview URL from the Vercel bot comment on your PR (`gh pr view <n> --comments`, the **Preview** link). Never build it from the branch name (Vercel shortens long names). The GitHub deployments API returns nothing for this repo.
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

## Token-saving tools

Every agent runs the same three tools. The product owner approved them on 2026-11-14. Set them up once per sandbox, then restart Claude Code.

| Tool | Does | Setup |
|---|---|---|
| RTK | Compresses shell output (git, pnpm, tests, builds) before you read it | `curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh \| sh`, then `rtk init -g --hook-only --no-patch` and add the `PreToolUse` hook it prints to `~/.claude/settings.json`. Check: `rtk gain` shows a savings table. The crates.io `rtk` is a different tool. |
| Caveman | Shortens your replies | Needs Node (`sudo apt-get install -y nodejs-24`). `claude plugin marketplace add JuliusBrussee/caveman`, then `claude plugin install caveman@caveman`. Turn its telemetry off: `export DO_NOT_TRACK=1` in `/etc/sandbox-persistent.sh` and `"env": {"DO_NOT_TRACK": "1"}` in `~/.claude/settings.json`. |
| Graphify | A local code graph to query before reading files | `uv tool install graphifyy` (two y's). The skill and hooks are already in this repo's `.claude/`. Build the graph with `graphify update .` |

Rules:
- RTK: if a compressed output hides something you need, rerun it with `rtk bypass <command>`. Never turn on RTK telemetry, pipelines or the proxy.
- Caveman: default level only, never `/ultracave` or `/megacave`. Text the product owner reads (chat replies, `ask_user`, PR bodies, review comments, commit messages) follows "How to talk to the product owner": plain words and full short sentences, not caveman grunt. Never sign in to Caveman Auto (it sends prompts to its cloud). Don't run `/caveman-compress` on repo docs.
- Graphify: `graphify-out/` is in `.gitignore`, so each agent builds its own. Never commit it.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- If graphify-out/ is missing (fresh clone or new sandbox), run `graphify update .` first. It is local and has no API cost.
