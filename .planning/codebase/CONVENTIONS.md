# Coding Conventions

**Analysis Date:** 2026-03-14

## Naming Patterns

**Files:**
- `kebab-case` for route, component, and library files across `app/`, `components/`, and `lib/`, for example `app/page.tsx`, `components/mission-control-panel.tsx`, and `lib/mission-control-mutations.ts`.
- Next.js special files keep framework names like `page.tsx`, `layout.tsx`, and `route.ts` in `app/`.
- There is no colocated test naming pattern in the repo yet; no `*.test.*` or `*.spec.*` files are committed.

**Functions:**
- `camelCase` for helpers, parser utilities, and event handlers, for example `resolveView`, `formatMissionLaneLabel`, `labelTaskStatus`, and `handleSubmit` in `app/page.tsx`, `components/mission-control-panel.tsx`, and `components/mission-intake-form.tsx`.
- Async functions do not use an `async` prefix; the name describes the operation, such as `getDashboardSnapshot`, `readAgentsSnapshot`, and `createMissionControlIntake` in `lib/openclaw.ts`, `lib/agents.ts`, and `lib/mission-control-mutations.ts`.
- UI handlers use `handle*` naming in client components, such as `handleSubmit` and `handleAction` in `components/mission-intake-form.tsx` and `components/mission-task-actions.tsx`.

**Variables:**
- `camelCase` for ordinary bindings and derived UI state, for example `activeView`, `primaryProviderLimit`, `missionControl`, and `launchpadApiBaseUrl` in `app/page.tsx` and `app/api/mission-control/intake/route.ts`.
- `UPPER_SNAKE_CASE` for module-level constants and lookup tables, for example `DASHBOARD_VIEWS`, `DASHBOARD_PANELS`, `DEFAULT_LAUNCHPAD_HOME`, and `TASK_LANES` in `app/page.tsx` and `lib/mission-control-mutations.ts`.
- No underscore prefix convention for private values; internal-only helpers stay file-local instead.

**Types:**
- `PascalCase` for type aliases and props shapes, with no `I` prefix, such as `DashboardSnapshot`, `MissionControlTaskSnapshot`, and `MissionControlPanelProps` in `lib/openclaw.ts`, `lib/mission-control.ts`, and `components/mission-control-panel.tsx`.
- Union string literals are preferred over enums for states and modes, for example `MissionControlTaskStatus`, `MissionControlTaskLane`, and `AgentWorkStatus` in `lib/mission-control.ts` and `lib/agents.ts`.
- Inline object types are used for narrow component props when reuse is not needed, especially in component parameter annotations.

## Code Style

**Formatting:**
- TypeScript-first Next.js codebase using `.ts` and `.tsx` only; `allowJs` is disabled and `strict` mode is enabled in `tsconfig.json`.
- Double quotes and semicolons are used consistently, as seen throughout `app/page.tsx`, `components/mission-control-panel.tsx`, and `lib/openclaw.ts`.
- Indentation is 2 spaces, with trailing commas generally omitted in object and argument lists.
- Control flow prefers guard clauses and early returns, especially in route handlers and data readers such as `app/api/mission-control/intake/route.ts` and `lib/agents.ts`.

**Linting:**
- ESLint 9 with flat config in `eslint.config.mjs`.
- The repo extends `eslint-config-next/core-web-vitals`; there is no local custom rule layer yet in `eslint.config.mjs`.
- Standard commands are `pnpm lint`, `pnpm typecheck`, and `pnpm check` from `package.json`.

## Import Organization

**Order:**
1. Node built-ins first in server modules, for example `node:fs/promises`, `node:os`, and `node:path` in `lib/openclaw.ts`, `lib/agents.ts`, and `lib/mission-control.ts`.
2. Framework and third-party imports next, such as `next/headers`, `next/navigation`, and `react` in `app/page.tsx`, `components/mission-intake-form.tsx`, and `components/mission-task-actions.tsx`.
3. Internal alias imports last using the `@/` path alias configured in `tsconfig.json`.

**Grouping:**
- Blank lines separate import groups.
- Imports are usually kept stable and readable rather than aggressively alphabetized; related internal imports are often grouped by source area, as in `app/page.tsx`.
- `import type` is used where it materially reduces runtime imports, especially in component and library boundaries like `components/mission-control-panel.tsx` and `lib/openclaw.ts`.

**Path Aliases:**
- `@/*` maps to the repo root via `tsconfig.json`.
- Internal imports should prefer `@/components/...` and `@/lib/...` over long relative chains.

## Error Handling

**Patterns:**
- Server-side readers prefer resilient snapshot returns over throwing, especially when reading local files or optional runtime state. `lib/openclaw.ts`, `lib/agents.ts`, and `lib/mission-control.ts` return `{ available: false, error }` style snapshots instead of crashing the page.
- Route handlers validate input early and return structured JSON errors with explicit HTTP status codes, as in `app/api/mission-control/intake/route.ts` and `app/api/mission-control/tasks/[taskId]/route.ts`.
- UI mutation components catch fetch failures locally and surface short inline error strings instead of escalating exceptions, as in `components/mission-intake-form.tsx` and `components/mission-task-actions.tsx`.

**Error Types:**
- There are no custom `Error` subclasses in the current repo.
- Invalid user input and missing required fields are handled as expected failures with `NextResponse.json(..., { status })` in `app/api/...`.
- File-system and runtime integration failures are translated into snapshot `error` strings or `500` JSON responses rather than thrown through the render tree.

## Logging

**Framework:**
- No dedicated logging framework is committed.
- `console` usage is effectively absent in application code; failures are returned to the UI/API contract instead.

**Patterns:**
- Diagnostics are encoded in snapshot metadata like `available`, `error`, `notes`, `path`, and `sourceKind` in `lib/openclaw.ts`, `lib/agents.ts`, and `lib/mission-control.ts`.
- Runtime observability is biased toward user-facing state over server logs.

## Comments

**When to Comment:**
- Comments are sparse. The codebase prefers descriptive function names, literal union types, and presenter helpers over inline explanation.
- When adding comments, match the existing bias toward explaining non-obvious behavior or fallback rules, not line-by-line narration.

**JSDoc/TSDoc:**
- Not used in the current codebase.
- Public understanding is carried by clear type names and file structure instead.

**TODO Comments:**
- There is no visible repo-wide TODO comment convention in committed source.
- Planned work tends to live in `plans/`, `runbooks/`, `README.md`, and `CHANGELOG.md` rather than inline source TODOs.

## Function Design

**Size:**
- Files often contain one exported surface plus many small local helpers, especially in presentation-heavy modules like `app/page.tsx`, `components/mission-control-panel.tsx`, `lib/openclaw.ts`, and `lib/mission-control.ts`.
- Small normalization, labeling, and parsing helpers are preferred over deeply nested inline logic.

**Parameters:**
- Simple helpers use positional parameters when the call site stays obvious, for example `labelLane(lane, copy)` and `buildHref(targetLocale, view, panel)`.
- Object parameters are used when the function needs multiple related values or optional settings, such as `getMissionTaskActions({ status, lane, mode })` and `presentCronJob({ job, locale, messages })`.

**Return Values:**
- Guard clauses and explicit fallback returns are the norm.
- Data-loading functions return shaped objects with UI-ready fields rather than leaking raw file contents upward.

## Module Design

**Exports:**
- Named exports are preferred for reusable functions, data loaders, and components, for example `MissionControlPanel`, `readAgentsSnapshot`, and `getDashboardSnapshot`.
- Default exports are reserved for Next.js route entrypoints like `app/page.tsx` and `app/layout.tsx`.

**Barrel Files:**
- No barrel-file pattern is in use.
- Modules are imported directly from their owning file path, which keeps boundaries explicit in a small-to-medium app.

## Brownfield Notes

- The repo is split cleanly by responsibility:
  - `app/` for Next.js routes and API handlers
  - `components/` for UI surfaces
  - `lib/` for parsing, snapshot shaping, and mission-control state logic
  - `runbooks/` and `plans/` for process and acceptance documentation
- User-facing copy should be routed through `locales/en.json` and `locales/zh.json`, not hardcoded in components, per `CONTRIBUTING.md`.
- The app is intentionally read-mostly against local OpenClaw and Launchpad state, with mutations limited to the Mission Control intake/task APIs in `app/api/mission-control/...`.

*Convention analysis: 2026-03-14*
*Update when patterns change*
