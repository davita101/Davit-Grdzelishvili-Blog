# Portfolio Blog

Personal portfolio and blog: MDX posts, projects and an about page. Built with Next.js (App Router), TypeScript and Tailwind CSS.

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. Copy `.env.example` to `.env.local` if you need to set variables (none are required to build).

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Run the app locally |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Run the Vitest suite once (`vitest run`) |

## Deployments

Hosted on Vercel.

| Environment | Source | Who deploys |
|---|---|---|
| Preview | Every pull request | Automatic. Vercel builds each PR push. |
| Production | `main` | Product owner only. Merges to `main`, then promotes the build. Automatic promotion is off. |

### Reading a preview (agents)

1. Get the preview URL from GitHub, never from the branch name (Vercel shortens long names):
   - the Vercel bot comment on the PR: `gh pr view <n> --comments`, or
   - the PR's deployments: `gh api repos/<owner>/<repo>/deployments?ref=<branch>`, then the `environment_url` of its latest status.
2. Wait until the deployment succeeds (the `Vercel` check on the PR is green).
3. Previews are protected. Send the bypass header on every request. The value comes from the `VERCEL_AUTOMATION_BYPASS_SECRET` environment variable; never paste it anywhere.

   ```bash
   curl -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" https://<preview-url>/
   ```

   For browser tests, also send `x-vercel-set-bypass-cookie: true` on the first request.
4. Check at 375 px and desktop width, in dark and light theme.

## Docs

- `docs/project.md`: what we build (stack, content model, security rules, design)
- `docs/plan.md`: the phases, in build order
- `docs/about-me.md`: owner facts
- `CLAUDE.md`: team rules
