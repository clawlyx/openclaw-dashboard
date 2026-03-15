# Architecture

**Analysis Date:** 2026-03-14

## Pattern Overview

**Overall:** Local-first Next.js App Router monolith with server-side snapshot aggregation, file-backed mission state, and small client islands for interaction.

**Key Characteristics:**
- A single route entry in `app/page.tsx` renders all dashboard workspaces (`overview`, `agents`, `mission-control`, `history`, `usage`, `scheduler`) from URL search params instead of separate route segments.
- The read path is server-heavy: `lib/openclaw.ts`, `lib/agents.ts`, and `lib/mission-control.ts` normalize local files, markdown reports, session logs, and command output into one dashboard snapshot.
- The write path is narrow: interactive mutations go through `app/api/mission-control/intake/route.ts`, `app/api/mission-control/tasks/[taskId]/route.ts`, and `app/api/theme/route.ts`.
- Runtime data is external to the app itself. Durable state lives in `~/.openclaw`, `demo/openclaw-home`, `~/.agent-launchpad`, markdown reports, JSON files, and a theme cookie.
- The app is intentionally dynamic. `app/page.tsx`, `app/api/snapshot/route.ts`, and the mission-control API routes all opt into `force-dynamic` behavior so fresh filesystem state is re-read per request.

## Layers

**Route Shell Layer:**
- Purpose: Resolve locale, theme, active workspace, and active panel; fetch a fresh snapshot; choose which surface to render.
- Contains: `app/layout.tsx`, `app/page.tsx`.
- Depends on: `next/headers`, `lib/i18n.ts`, `lib/theme.ts`, `lib/dashboard-presenters.ts`, `lib/openclaw.ts`, and the panel components in `components/`.
- Used by: Browser requests to `/`.

**Snapshot Read Layer:**
- Purpose: Translate workstation state into typed read models for usage, cron health, agents, and mission control.
- Contains: `lib/openclaw.ts`, `lib/agents.ts`, `lib/mission-control.ts`.
- Depends on: `node:fs/promises`, `node:path`, `node:os`, JSON parsing, markdown parsing, and `execFile("openclaw", ["models"])` inside `lib/openclaw.ts`.
- Used by: `app/page.tsx` and `app/api/snapshot/route.ts`.

**Mutation and Workflow Layer:**
- Purpose: Enforce mission-task transitions and persist local Launchpad state/artifacts when the dashboard is used as an operator surface.
- Contains: `lib/mission-control-actions.ts`, `lib/mission-control-mutations.ts`.
- Depends on: Mission-control types from `lib/mission-control.ts`, filesystem writes, and repo/doc path derivation.
- Used by: `app/api/mission-control/intake/route.ts` and `app/api/mission-control/tasks/[taskId]/route.ts`.

**Presentation and Localization Layer:**
- Purpose: Convert normalized data into localized labels, formatted timestamps, quota text, and reusable panel UIs.
- Contains: `lib/dashboard-presenters.ts`, `lib/i18n.ts`, `locales/en.json`, `locales/zh.json`, and server-compatible panels such as `components/agents-office-panel.tsx`, `components/mission-control-panel.tsx`, `components/provider-limit-windows.tsx`, `components/usage-history-panel.tsx`, and `components/section-shell.tsx`.
- Depends on: Snapshot types from `lib/`, locale dictionaries, and React rendering.
- Used by: `app/page.tsx` and nested client components.

**Client Interaction Layer:**
- Purpose: Keep browser-only state and user actions isolated from the server-rendered shell.
- Contains: `components/theme-switch.tsx`, `components/agents-virtual-office-panel.tsx`, `components/mission-intake-form.tsx`, `components/mission-task-actions.tsx`.
- Depends on: `fetch` calls into local API routes, `next/navigation`, and the data/contracts assembled on the server.
- Used by: End users after initial render.

## Data Flow

**Dashboard Page Render:**

1. A request reaches `app/layout.tsx` and `app/page.tsx`.
2. `app/layout.tsx` reads the theme cookie via `next/headers`; `app/page.tsx` resolves `lang`, `view`, and `panel` from `searchParams`.
3. `app/page.tsx` calls `getDashboardSnapshot()` from `lib/openclaw.ts`.
4. `lib/openclaw.ts` resolves the active OpenClaw home (`OPENCLAW_HOME`, `~/.openclaw`, or `demo/openclaw-home`) and assembles usage and cron data locally.
5. `lib/openclaw.ts` also pulls in `readAgentsSnapshot()` from `lib/agents.ts` and `readMissionControlSnapshot()` from `lib/mission-control.ts`.
6. `app/page.tsx` localizes and formats the snapshot with `lib/i18n.ts` and `lib/dashboard-presenters.ts`.
7. The page renders a shared shell plus exactly one active panel body, usually through a large switch in `renderActiveContent()` inside `app/page.tsx`.

**Mission Intake and Task Mutation:**

1. `components/mission-intake-form.tsx` and `components/mission-task-actions.tsx` submit browser actions with `fetch()`.
2. `app/api/mission-control/intake/route.ts` and `app/api/mission-control/tasks/[taskId]/route.ts` validate the request and choose a mode based on `AGENT_LAUNCHPAD_API_BASE_URL`.
3. In remote mode, the route handlers proxy workflow operations to a Launchpad API.
4. In local mode, the route handlers call `createMissionControlIntake()` or `updateMissionControlTask()` from `lib/mission-control-mutations.ts`.
5. Local mutation code updates Launchpad JSON state and syncs markdown artifact bundles under `docs/briefs`, `docs/rfc`, `docs/qa`, and `docs/release`.
6. The client calls `router.refresh()`, causing `app/page.tsx` to rebuild the server snapshot.

**Theme Change:**

1. `components/theme-switch.tsx` links to `app/api/theme/route.ts` with the chosen mode and current path.
2. `app/api/theme/route.ts` sanitizes the redirect target with `lib/theme.ts`, sets the `oc-dashboard-theme` cookie, and returns a `303`.
3. The next server render reads the cookie in `app/layout.tsx` and sets `data-theme` on the `<html>` element.

**State Management:**
- Stateless request handling on the Next.js side; there is no application database and no long-lived in-memory cache.
- Durable data lives in external files such as `demo/openclaw-home/workspace/memory/usage/*.md`, `demo/openclaw-home/cron/jobs.json`, `demo/openclaw-home/agents/dashboard.json`, and Agent Launchpad files under `~/.agent-launchpad`.
- Client-side state is limited to UI interactions in `components/agents-virtual-office-panel.tsx`, `components/mission-intake-form.tsx`, `components/mission-task-actions.tsx`, and `components/theme-switch.tsx`.
- Local mutations are serialized with an in-process promise queue in `lib/mission-control-mutations.ts` to avoid overlapping file writes.

## Key Abstractions

**Dashboard Snapshot:**
- Purpose: Unified read model for the entire dashboard surface.
- Examples: `DashboardSnapshot`, `UsageSnapshot`, and `CronSnapshot` in `lib/openclaw.ts`.
- Pattern: Aggregation DTO assembled once per request and fanned out into panels.

**Snapshot Reader / Normalizer:**
- Purpose: Convert messy external sources into stable UI-facing shapes.
- Examples: `readUsageReports()` and `readCronJobs()` in `lib/openclaw.ts`, `readAgentsSnapshot()` in `lib/agents.ts`, `readMissionControlSnapshot()` in `lib/mission-control.ts`.
- Pattern: Adapter/parser layer with fallback behavior and human-readable notes.

**Mission Task Action Model:**
- Purpose: Decide which task transitions are legal in local vs. remote mutation mode.
- Examples: `getMissionTaskActions()` and `isMissionTaskActionAllowed()` in `lib/mission-control-actions.ts`.
- Pattern: Small state-machine-like rules module shared by API handlers and UI actions.

**Single-Route Workspace Switchboard:**
- Purpose: Keep the product as one dashboard route while still exposing multiple workspaces and subpanels.
- Examples: `DASHBOARD_VIEWS`, `DASHBOARD_PANELS`, `resolveView()`, `resolvePanel()`, and `renderActiveContent()` in `app/page.tsx`.
- Pattern: URL-driven composition inside one server component.

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Any page request.
- Responsibilities: Load fonts, resolve theme from cookies, and attach global styles.

**Dashboard Page:**
- Location: `app/page.tsx`
- Triggers: Requests to `/` with optional `lang`, `view`, and `panel` params.
- Responsibilities: Fetch the full snapshot, localize it, and render the active workspace.

**Snapshot API:**
- Location: `app/api/snapshot/route.ts`
- Triggers: HTTP `GET /api/snapshot`.
- Responsibilities: Return the raw normalized dashboard snapshot as JSON.

**Mission Control APIs:**
- Location: `app/api/mission-control/intake/route.ts` and `app/api/mission-control/tasks/[taskId]/route.ts`
- Triggers: Browser form/button actions.
- Responsibilities: Validate requests, proxy to remote Launchpad when configured, or mutate local Launchpad state.

**Theme Redirect API:**
- Location: `app/api/theme/route.ts`
- Triggers: Theme toggle links.
- Responsibilities: Persist the theme cookie and redirect back to the current page.

**Local Dev Runner:**
- Location: `scripts/next-runner.mjs`
- Triggers: `pnpm dev` and `pnpm start`.
- Responsibilities: Read `.env` / `.env.local`, derive host and port from `DASHBOARD_URL`, and spawn the Next.js binary.

## Error Handling

**Strategy:** Fail soft on read paths, fail explicit on write paths.

**Patterns:**
- Read helpers in `lib/openclaw.ts`, `lib/agents.ts`, and `lib/mission-control.ts` catch source failures and return structured snapshot objects with `available`, `error`, and `notes` fields instead of throwing through the whole page render.
- Missing live data usually degrades to demo/sample data, for example `demo/openclaw-home` in `lib/openclaw.ts` and `SAMPLE_STATE` / `SAMPLE_HEARTBEAT` in `lib/mission-control.ts`.
- API routes validate early and return HTTP status codes (`400`, `409`, `502`, `500`) with JSON payloads.
- Client islands surface API failures inline and then rely on `router.refresh()` after successful writes.
- Local file mutations are serialized in `lib/mission-control-mutations.ts` with `mutationQueue` rather than optimistic parallel writes.

## Cross-Cutting Concerns

**Freshness:**
- `app/page.tsx`, `app/api/snapshot/route.ts`, and the mission-control API routes are dynamic so file-backed state is not treated as static build data.

**Localization:**
- All user-facing copy is centralized in `locales/en.json` and `locales/zh.json`, with lookup and interpolation in `lib/i18n.ts`.
- `lib/dashboard-presenters.ts` handles translation of machine-oriented snapshot text into UI labels.

**Theming:**
- Theme state is cookie-based through `lib/theme.ts`, `app/api/theme/route.ts`, and `app/layout.tsx`.

**Source Resolution and Fallbacks:**
- `lib/openclaw.ts` resolves `OPENCLAW_HOME` and can fall back to `demo/openclaw-home`.
- `lib/mission-control.ts` resolves `AGENT_LAUNCHPAD_HOME` / `AGENT_LAUNCHPAD_STATE_FILE` and falls back to bundled sample records when local state is absent.

**Authentication / Trust Model:**
- There is no application-level auth boundary in this repo.
- The dashboard assumes a trusted local or self-hosted environment and reads workstation files directly.

**Validation Discipline:**
- Type safety comes from strict TypeScript in `tsconfig.json`.
- Runtime request validation is implemented manually in the API route files rather than through a dedicated schema library.

---

*Architecture analysis: 2026-03-14*
*Update when major patterns change*
