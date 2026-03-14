# Codebase Concerns

**Analysis Date:** 2026-03-14

## Tech Debt

**Single-route dashboard shell:**
- Issue: `app/page.tsx` owns view selection, data formatting, and large chunks of workspace composition in one server component.
- Why: The product grew from a smaller dashboard into a workstation without route/module re-segmentation.
- Impact: New workspace features are easy to add quickly, but harder to isolate, review, and test independently.
- Fix approach: Extract per-workspace server presenters or route segments once the Phase 2+ workstation surfaces settle.

**Heuristic ownership and room inference:**
- Issue: `components/agents-virtual-office-panel.tsx` still carries fallback lane/room inference in parallel with explicit ownership data.
- Why: Live installs may not emit explicit owner fields yet, so the UI must preserve backward compatibility.
- Impact: Ownership logic is split between task data, agent data, and UI fallback rules, which increases the chance of drift.
- Fix approach: Push explicit ownership into live runtime state consistently, then reduce UI-side inference to a narrow compatibility path.

**Large scene component:**
- Issue: `components/agents-virtual-office-panel.tsx` mixes data joins, room selection state, pixel-scene rendering, and right-rail content in one large client component.
- Why: The virtual office was added iteratively as one cohesive surface.
- Impact: Small UI changes require care because ownership logic, layout logic, and rendering logic live together.
- Fix approach: Split the room/mission data model, scene renderer, and right-rail cards into smaller focused components after Phase 2 drawer work lands.

## Known Bugs

**Partial ownership data can still fall back to inferred room routing:**
- Symptoms: A task may show `Ownership: Inferred` even when the associated agent snapshot already carries a matching `currentTaskId`.
- Trigger: Mission Control task data lacks `ownerAgentId` / `ownerRoomId`, but `agents/dashboard.json` has task-reference fields.
- Workaround: Inspect both the mission queue card and the agent desk feed together.
- Root cause: Mission Control remains the source of truth for ownership, and the agent task refs are not yet used to upgrade task ownership automatically.
- Blocked by: Upstream runtime and Launchpad ownership fidelity outside this repo.

**Development server lock contention in parallel sessions:**
- Symptoms: `pnpm dev` can fail with `.next/dev/lock` acquisition errors.
- Trigger: Multiple local sessions try to run `next dev` in the same repo at once.
- Workaround: Use `pnpm start` after a build on a separate port for verification, or stop the existing dev server first.
- Root cause: Next.js dev server maintains a single repo-local lock file.

## Security Considerations

**Local mutation APIs assume trusted local access:**
- Risk: `app/api/mission-control/intake/route.ts` and `app/api/mission-control/tasks/[taskId]/route.ts` mutate local Launchpad state without any auth layer.
- Current mitigation: The app is designed as a local workstation, not a public multi-user service.
- Recommendations: Keep deployments private/local-only unless an authentication boundary is added around mutation routes.

**Filesystem-backed data sources are operator-controlled:**
- Risk: `OPENCLAW_HOME`, `AGENT_LAUNCHPAD_HOME`, and `AGENT_LAUNCHPAD_STATE_FILE` can point the app at arbitrary host paths.
- Current mitigation: Paths are resolved locally and exposed mainly through operator-managed env vars.
- Recommendations: Treat env configuration as trusted-only input and avoid exposing this app as a generic hosted service without path allowlisting.

## Performance Bottlenecks

**Per-request snapshot aggregation:**
- Problem: `lib/openclaw.ts`, `lib/agents.ts`, and `lib/mission-control.ts` reread local files and reports on demand for every dynamic request.
- Measurement: No benchmark is committed; the architecture is inherently synchronous around filesystem and child-process I/O.
- Cause: Fresh local workstation data is prioritized over caching.
- Improvement path: Introduce lightweight caching or memoized polling windows for expensive sources like usage reports and CLI-derived provider limits.

**Heavy client office panel:**
- Problem: `components/agents-virtual-office-panel.tsx` computes room joins and renders a large SVG scene plus several rails in one client component.
- Measurement: No formal profiling is committed; complexity is visible from file size and state density.
- Cause: The virtual office and mission queue join-up accumulated in one interactive surface.
- Improvement path: Extract pure data helpers and memoized subcomponents before adding drawers and pressure scoring.

## Fragile Areas

**Mission Control local mutation pipeline:**
- Why fragile: `lib/mission-control-mutations.ts` is responsible for task-state transitions, derived follow-on tasks, artifact paths, and local file writes.
- Common failures: State drift, accidental invalid transitions, or mismatch between remote and local behavior.
- Safe modification: Reuse the existing action rules in `lib/mission-control-actions.ts`, keep changes narrow, and verify both local and remote mutation paths.
- Test coverage: No automated mutation test suite is committed; verification is mostly manual.

**Snapshot normalization contracts:**
- Why fragile: `lib/mission-control.ts` and `lib/agents.ts` normalize messy external state with many optional fields.
- Common failures: Small schema changes can silently drop fields or break exact optional-property typing.
- Safe modification: Add fields as optional first, use the existing `asString`/`asNumber` helpers, and verify `/api/snapshot` against demo data after each contract change.
- Test coverage: Typecheck protects shape consistency, but there are no parser/unit tests.

## Scaling Limits

**Local-first, single-operator architecture:**
- Current capacity: One operator-facing workstation reading local filesystem state.
- Limit: There is no shared backend, persistence layer, or auth model for concurrent users.
- Symptoms at limit: Shared deployment would expose mutation APIs and path-based data sources without proper multi-user controls.
- Scaling path: Add authenticated server-side storage and a proper access model before treating the app as anything beyond a local workstation.

**Single route for all workspaces:**
- Current capacity: One page route with query-param workspace switching.
- Limit: As more workstation surfaces arrive, the page-level component and snapshot assembly become harder to reason about.
- Symptoms at limit: Slower change velocity, more coupling across panels, and broader regression risk per edit.
- Scaling path: Split workspaces into dedicated route segments or server modules once the product surface stabilizes.

## Dependencies at Risk

**`latest` version ranges in `package.json`:**
- Risk: `next`, `react`, `react-dom`, TypeScript, and `@types/*` resolve from `latest`, which can introduce breaking changes on reinstall.
- Impact: Reproducibility and upgrade control are weaker than they should be for a workstation app with evolving client/server contracts.
- Migration plan: Pin explicit semver ranges once the GSD migration settles and future milestone work can ride intentional upgrades.

**External `openclaw` CLI dependency:**
- Risk: `lib/openclaw.ts` shells out to `openclaw models`, but the CLI version is not pinned in this repo.
- Impact: Provider-limit parsing can drift if CLI output changes.
- Migration plan: Document expected CLI output shape or move to a versioned JSON interface when available.

## Missing Critical Features

**No detail drawer or mission-centric deep inspection yet:**
- Problem: The operator can now see ownership source, but cannot yet open a drawer to inspect current task, last task, next step, and blockers in one place.
- Current workaround: Use the office view for overview and Mission Control for deeper task state.
- Blocks: The richer “who owns this and what happens next?” workstation flow.
- Implementation complexity: Medium; already scoped as Phase 2.

**No inline office actions yet:**
- Problem: The office view visualizes ownership but cannot move work forward directly.
- Current workaround: Use Mission Control task controls for mutations.
- Blocks: The “operate from the office surface alone” promise.
- Implementation complexity: Medium; already scoped as Phase 3.

## Test Coverage Gaps

**No automated tests for snapshot parsing and joins:**
- What's not tested: `lib/openclaw.ts`, `lib/agents.ts`, `lib/mission-control.ts`, and the ownership join logic in `components/agents-virtual-office-panel.tsx`.
- Risk: Schema changes can regress demo/live parsing without fast feedback.
- Priority: High
- Difficulty to test: Moderate; needs fixture-driven parser tests and possibly component integration coverage.

**No automated mutation coverage:**
- What's not tested: `lib/mission-control-mutations.ts` and the corresponding task-action API routes.
- Risk: Transition regressions may only surface during manual queue operation.
- Priority: High
- Difficulty to test: Moderate to High; requires temp-state fixtures and route/mutation harnesses.

**No committed browser E2E suite:**
- What's not tested: Cross-panel user flows such as mission intake, office ownership visualization, and task-action refresh behavior.
- Risk: UI regressions across server/client boundaries can slip through even when typecheck/lint/build pass.
- Priority: Medium
- Difficulty to test: Moderate; Playwright-style scripted flows would cover this well.

---
*Concerns audit: 2026-03-14*
*Update as issues are fixed or new ones discovered*
