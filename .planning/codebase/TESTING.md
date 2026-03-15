# Testing Patterns

**Analysis Date:** 2026-03-14

## Test Framework

**Runner:**
- No automated unit or integration test runner is configured in `package.json`.
- There is no committed `vitest.config.*`, `jest.config.*`, `playwright.config.*`, `*.test.*`, or `*.spec.*` file in the repo today.

**Assertion Library:**
- None configured in-repo because there is no committed automated test suite yet.

**Run Commands:**
```bash
pnpm lint                                   # ESLint static analysis
pnpm typecheck                              # TypeScript compile-time validation
pnpm build                                  # Production build validation
pnpm check                                  # Combined lint + typecheck + build
OPENCLAW_HOME=demo/openclaw-home pnpm dev   # Manual UI validation against safe demo data
```

## Test File Organization

**Location:**
- No automated test tree exists yet.
- Validation evidence currently lives in docs and runbooks rather than executable test files, especially under `runbooks/`.

**Naming:**
- Manual acceptance docs use release- and feature-scoped runbook names such as `runbooks/openclaw-dashboard-v2-mission-control-e2e.md` and `runbooks/openclaw-dashboard-1-2-0-explicit-ownership-e2e.md`.

**Structure:**
```text
runbooks/
  openclaw-dashboard-v2-mission-control-e2e.md
  openclaw-dashboard-1-2-0-explicit-ownership-e2e.md
  openclaw-dashboard-1-1-0-release-candidate.md

app/
  api/
  page.tsx

components/
  mission-control-panel.tsx
  agents-office-panel.tsx

lib/
  mission-control.ts
  openclaw.ts
```

## Test Structure

**Suite Organization:**
- The current repo relies on checklist-style manual E2E flows instead of `describe` / `it` suites.
- The pattern is:
  1. define preconditions
  2. define test input
  3. walk the operator flow step by step
  4. verify UI pages and API snapshot contracts
  5. record acceptance and known scope limits
- See `runbooks/openclaw-dashboard-v2-mission-control-e2e.md` and `runbooks/openclaw-dashboard-1-2-0-explicit-ownership-e2e.md`.

**Patterns:**
- Manual validation uses the bundled demo dataset where possible via `OPENCLAW_HOME=demo/openclaw-home`, as documented in `README.md` and `CONTRIBUTING.md`.
- Snapshot and contract checks are done through pages like `/?view=agents&panel=virtual`, `/?view=mission-control`, and `/api/snapshot` in the runbooks.
- UI changes are expected to include manual smoke validation and, when relevant, screenshot/demo verification per `CONTRIBUTING.md`.

## Mocking

**Framework:**
- No mocking framework is committed because there is no automated test runner yet.

**Patterns:**
- The practical substitute for mocks is the bundled synthetic dataset under `demo/openclaw-home`, which provides safe, deterministic local input for `lib/openclaw.ts` and `lib/agents.ts`.
- Mission Control also includes sample fallback state inside `lib/mission-control.ts` for demo/public-preview scenarios.

## Fixtures and Factories

**Test Data:**
- The primary validation fixture is the bundled demo OpenClaw home under `demo/openclaw-home`.
- Mission Control sample state is embedded in `lib/mission-control.ts` to keep demo and first-run experiences working without a live backend.
- There are no shared test factories yet.

**Location:**
- Demo fixture data lives in `demo/openclaw-home/...`.
- Manual scenario definitions live in `runbooks/`.

## Coverage

**Requirements:**
- No line or branch coverage target is configured.
- CI does not enforce automated test coverage because there is no automated suite yet.

**Configuration:**
- None.

## Test Types

**Static Validation:**
- `pnpm lint` runs ESLint with `eslint-config-next/core-web-vitals` from `eslint.config.mjs`.
- `pnpm typecheck` runs `tsc --noEmit` with strict TypeScript settings from `tsconfig.json`.
- `pnpm build` validates that the production Next.js app compiles successfully.

**Integration / Contract Validation:**
- API and snapshot contract checks are manual today, centered on `/api/snapshot` and the Mission Control API routes in `app/api/mission-control/...`.
- The runbooks explicitly validate joined agent and mission-control data, including ownership, queue state, and lane progression.

**E2E / UI Validation:**
- Manual E2E is the real testing layer right now.
- The repo documents full acceptance flows in `runbooks/openclaw-dashboard-v2-mission-control-e2e.md` and `runbooks/openclaw-dashboard-1-2-0-explicit-ownership-e2e.md`.
- Demo-driven UI checks are expected for screenshot-safe verification, especially when touching public assets or localized UI states.

## CI Reality

- CI is defined in `.github/workflows/ci.yml`.
- Current workflow runs `pnpm install --frozen-lockfile`, `pnpm typecheck`, and `pnpm build` with `OPENCLAW_HOME=demo/openclaw-home`.
- CI does **not** currently run `pnpm lint`, even though local docs recommend it in `README.md` and `CONTRIBUTING.md`.

## Brownfield Recommendations

- Treat `pnpm check` plus demo-backed manual smoke validation as the minimum acceptance bar until an automated suite exists.
- The most valuable first automated tests would be `lib/mission-control-actions.ts`, `lib/mission-control-mutations.ts`, the snapshot readers in `lib/mission-control.ts`, `lib/agents.ts`, and `lib/openclaw.ts`, plus one API contract test for `app/api/mission-control/intake/route.ts`.
- If browser automation is added later, keep demo data as the default fixture so screenshots and assertions stay publishable.

*Testing analysis: 2026-03-14*
*Update when patterns change*
