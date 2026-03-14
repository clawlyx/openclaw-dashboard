# External Integrations

**Analysis Date:** 2026-03-14

## APIs & External Services

**Payment Processing:**
- None. There is no payment SDK or billing integration in `package.json` or `app/api/`.

**Email/SMS:**
- None. No email or messaging service client is present in `package.json`, `lib/`, or `app/api/`.

**External APIs:**
- Agent Launchpad API (optional) for remote mission-control intake and workflow mutation when `AGENT_LAUNCHPAD_API_BASE_URL` is set.
  - Integration method: server-side REST `fetch` in `app/api/mission-control/intake/route.ts` and `app/api/mission-control/tasks/[taskId]/route.ts`.
  - Auth: no auth header or token handling is implemented in this repo; requests only set `content-type: application/json`.
  - Endpoints used: `/api/ideas`, `/api/ideas/{ideaId}/promote`, `/api/tasks/{taskId}`, `/api/features/{featureId}`, and `/api/features/{featureId}/workflow`.
- Google Fonts at build/render time through `next/font/google` in `app/layout.tsx`.
  - SDK/Client: Next.js built-in font loader.
  - Auth: none.
  - Assets used: `Space_Grotesk` and `IBM_Plex_Mono`.
- Local `openclaw` CLI for live provider-limit enrichment in `lib/openclaw.ts`.
  - Integration method: `execFile("openclaw", ["models"])`.
  - Auth: inherited from the host OpenClaw install and local auth profiles under `agents/main/agent/auth-profiles.json`.

## Data Storage

**Databases:**
- None. There is no ORM, SQL driver, or remote database client in `package.json`.

**File Storage:**
- Local OpenClaw home, resolved from `OPENCLAW_HOME`, `~/.openclaw`, or fallback `demo/openclaw-home` in `lib/openclaw.ts`.
  - Usage reports: markdown files under `workspace/memory/usage/*.md`, parsed in `lib/openclaw.ts`.
  - Cron jobs: `cron/jobs.json`, parsed in `lib/openclaw.ts`.
  - Agent office snapshot: `agents/dashboard.json`, read in `lib/agents.ts`.
  - Agent session logs fallback: `agents/*/sessions/*.jsonl`, read in `lib/agents.ts` and `lib/openclaw.ts`.
  - Provider profile metadata: `agents/main/agent/auth-profiles.json`, read in `lib/openclaw.ts`.
- Local Agent Launchpad state for mission control in `lib/mission-control.ts` and `lib/mission-control-mutations.ts`.
  - Connection: `AGENT_LAUNCHPAD_HOME` / `AGENT_LAUNCHPAD_STATE_FILE`, defaulting to `~/.agent-launchpad/data/launchpad-state.json`.
  - Heartbeat: `~/.agent-launchpad/runtime/worker-heartbeat.json`.
  - Local mutation outputs: feature docs written into `docs/briefs/`, `docs/rfc/`, `docs/qa/`, and `docs/release/` by `lib/mission-control-mutations.ts`.
- Bundled demo dataset under `demo/openclaw-home/` for public previews and first-run fallback, documented in `README.md`.

**Caching:**
- None. Snapshot reads are file-based and fresh on request.
  - `app/page.tsx` and the route handlers export `dynamic = "force-dynamic"`.
  - Remote Launchpad `fetch` calls explicitly use `cache: "no-store"` in `app/api/mission-control/intake/route.ts` and `app/api/mission-control/tasks/[taskId]/route.ts`.

## Authentication & Identity

**Auth Provider:**
- No end-user authentication is implemented. The dashboard has no login flow, auth middleware, or session store.
  - Cookie usage is limited to the theme preference set by `app/api/theme/route.ts` and consumed via `THEME_COOKIE` in `lib/theme.ts`, `app/layout.tsx`, and `app/page.tsx`.

**OAuth Integrations:**
- None for dashboard sign-in.
- The app only reads already-established provider metadata from local OpenClaw files and usage reports in `lib/openclaw.ts`; it does not initiate OAuth flows itself.

## Monitoring & Observability

**Error Tracking:**
- None. There is no Sentry, Datadog, Honeycomb, or similar client in `package.json`.

**Analytics:**
- None. No product analytics SDK is present in `app/`, `components/`, or `lib/`.

**Logs:**
- Local OpenClaw session logs under `agents/*/sessions/*.jsonl` are parsed as an observability input in `lib/agents.ts` and `lib/openclaw.ts`.
- GitHub Actions logs are available for CI jobs in `.github/workflows/ci.yml` and `.github/workflows/commit-policy.yml`.

## CI/CD & Deployment

**Hosting:**
- No host-specific deployment integration is committed. The repo is a generic Next.js app launched locally via `scripts/next-runner.mjs`.
  - Deployment mode in docs is local-first; see `README.md`.
  - Demo/public-preview mode uses `OPENCLAW_HOME=demo/openclaw-home`, also documented in `README.md`.

**CI Pipeline:**
- GitHub Actions validates the repo in `.github/workflows/ci.yml`.
  - Workflows: install with pnpm, run `pnpm typecheck`, and run `pnpm build`.
  - Secrets: none required in the committed workflow; build injects `OPENCLAW_HOME=demo/openclaw-home`.
- GitHub Actions commit policy in `.github/workflows/commit-policy.yml`.
  - Integration: `actions/github-script`.
  - Scope: validates conventional commit titles and GitHub-verified signatures on pushes to `main` and pull requests.

## Environment Configuration

**Development:**
- Required env vars: `OPENCLAW_HOME` for non-default data roots and `DASHBOARD_URL` for custom local binding; see `.env.example` and `scripts/next-runner.mjs`.
- Optional env vars: `DASHBOARD_HOST`, `DASHBOARD_PORT`, `HOST`, `PORT`, `NEXT_PUBLIC_APP_URL`, `AGENT_LAUNCHPAD_API_BASE_URL`, `AGENT_LAUNCHPAD_HOME`, `AGENT_LAUNCHPAD_STATE_FILE`, and `AGENT_LAUNCHPAD_REPO_ROOT`.
- Secrets location: `.env` / `.env.local` on the host. The repo only ships `.env.example`.
- Mock/stub services: `demo/openclaw-home/` for dashboard data, plus bundled sample mission-control state in `lib/mission-control.ts` when no Launchpad state file exists.

**Staging:**
- No dedicated staging environment or staging-specific config is committed.

**Production:**
- Secrets management is not defined in-repo; it is expected to come from host environment variables if this app is deployed.
- Live mode requires host filesystem access to the OpenClaw home and, if enabled, the Agent Launchpad home or API base URL.

## Webhooks & Callbacks

**Incoming:**
- None. The route handlers under `app/api/` are first-party app endpoints, not third-party webhook receivers.

**Outgoing:**
- Agent Launchpad workflow calls are the only outbound HTTP requests in app code.
  - Trigger: mission intake submission and mission task actions from `components/mission-intake-form.tsx` and `components/mission-task-actions.tsx`.
  - Endpoint family: the Launchpad routes invoked by `app/api/mission-control/intake/route.ts` and `app/api/mission-control/tasks/[taskId]/route.ts`.
  - Retry logic: none beyond the default `fetch` attempt; failures are surfaced directly in the JSON response.

---

*Integration audit: 2026-03-14*
*Update when adding or removing external services*
