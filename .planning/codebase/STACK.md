# Technology Stack

**Analysis Date:** 2026-03-14

## Languages

**Primary:**
- TypeScript 5.9.3 (manifest uses `latest`, lockfile currently resolves 5.9.3) for all application, route-handler, and data-access code in `app/`, `components/`, and `lib/`; see `package.json`, `pnpm-lock.yaml`, and `tsconfig.json`.

**Secondary:**
- JavaScript (ES modules on Node.js) for the local launcher in `scripts/next-runner.mjs`.
- JSON for locale catalogs and bundled demo/state fixtures in `locales/en.json`, `locales/zh.json`, and `demo/openclaw-home/`.
- YAML for CI policy and validation in `.github/workflows/ci.yml` and `.github/workflows/commit-policy.yml`.

## Runtime

**Environment:**
- Node.js `>=20.0.0` from `package.json`.
- Next.js App Router server runtime for the main page and route handlers in `app/page.tsx`, `app/layout.tsx`, and `app/api/**/route.ts`.
- Browser runtime only for interactive islands marked with `"use client"` in `components/agents-virtual-office-panel.tsx`, `components/mission-intake-form.tsx`, `components/mission-task-actions.tsx`, and `components/theme-switch.tsx`.

**Package Manager:**
- `pnpm` 10.30.3 from `package.json`.
- Lockfile: `pnpm-lock.yaml` present.

## Frameworks

**Core:**
- Next.js 16.1.6 (`pnpm-lock.yaml`) for routing, server rendering, metadata, route handlers, cookies, and font loading; configured in `next.config.ts`.
- React 19.2.4 and React DOM 19.2.4 (`pnpm-lock.yaml`) for the UI layer across `app/` and `components/`.

**Testing:**
- No dedicated unit or E2E test framework is configured. `package.json` exposes `lint`, `typecheck`, `build`, and combined `check`, but there is no `vitest`, `jest`, `playwright`, or `cypress` config in the repo.

**Build/Dev:**
- TypeScript 5.9.3 with strict mode, `bundler` resolution, and `@/*` path aliasing in `tsconfig.json`.
- ESLint 9.39.4 with `eslint-config-next` 16.1.6 in `eslint.config.mjs`.
- Custom Node launcher in `scripts/next-runner.mjs` to derive host/port from env before delegating to the local Next CLI.
- GitHub Actions validation in `.github/workflows/ci.yml` on Node 20 and pnpm 10.30.3.

## Key Dependencies

**Critical:**
- `next` 16.1.6 for the full-stack app surface in `app/page.tsx`, `app/layout.tsx`, and `app/api/**/route.ts`.
- `react` 19.2.4 for component composition across `components/*.tsx`.
- `react-dom` 19.2.4 for client hydration of interactive panels such as `components/agents-virtual-office-panel.tsx`.

**Infrastructure:**
- Node built-ins `fs/promises`, `path`, and `os` for local data ingestion from OpenClaw and Agent Launchpad state in `lib/openclaw.ts`, `lib/agents.ts`, `lib/mission-control.ts`, and `lib/mission-control-mutations.ts`.
- Node `child_process` and `util` for shelling out to `openclaw models` in `lib/openclaw.ts` and spawning the local Next process in `scripts/next-runner.mjs`.
- `next/font/google` for self-hosted Google fonts in `app/layout.tsx`.

## Configuration

**Environment:**
- `.env` / `.env.local` are the primary config entrypoints; the documented baseline is `.env.example`.
- `OPENCLAW_HOME` selects the live data root in `lib/openclaw.ts`; if absent, the app tries `~/.openclaw` and then `demo/openclaw-home`.
- `DASHBOARD_URL` is parsed by `scripts/next-runner.mjs` to set host, port, and `NEXT_PUBLIC_APP_URL`.
- Optional mission-control/launchpad env vars are `AGENT_LAUNCHPAD_API_BASE_URL`, `AGENT_LAUNCHPAD_HOME`, `AGENT_LAUNCHPAD_STATE_FILE`, and `AGENT_LAUNCHPAD_REPO_ROOT`; see `app/api/mission-control/intake/route.ts`, `app/api/mission-control/tasks/[taskId]/route.ts`, `lib/mission-control.ts`, and `lib/mission-control-mutations.ts`.

**Build:**
- `next.config.ts` enables `typedRoutes`.
- `tsconfig.json` defines strict compiler behavior and the `@/*` alias.
- `eslint.config.mjs` applies Next core-web-vitals lint rules.
- `.github/workflows/ci.yml` validates install, typecheck, and build against the bundled demo dataset.

## Platform Requirements

**Development:**
- Any machine with Node.js 20+, pnpm 10.30.3, and filesystem access to an OpenClaw home or the bundled demo data.
- A working `openclaw` executable on `PATH` is needed only for live provider-limit refreshes in `lib/openclaw.ts`; the dashboard still runs without it by falling back to report or session-log parsing.

**Production:**
- Standard Next.js Node deployment; no repo-specific container, Dockerfile, or `vercel.json` is committed.
- The app expects host filesystem access to OpenClaw data and, for mission-control local mutations, optional access to `~/.agent-launchpad` or its configured override.

---

*Stack analysis: 2026-03-14*
*Update after major dependency or runtime changes*
