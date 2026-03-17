---
phase: 09-archive-legacy-repo-task-systems
plan: 01
subsystem: api
tags: [mission-control, nextjs, archive-boundary, local-state]
requires:
  - phase: 08-agent-clarity
    provides: agent-facing mission-control surfaces that now consume the cleaned archive contract
provides:
  - local mission archive runtime paths and bundled post-archive sample state
  - retired remote repo-task mutation bridge with explicit 410 archive errors
  - stable mission-control snapshot shape for later provenance work
affects: [mission-control, api-routes, phase-10]
tech-stack:
  added: []
  patterns: [local mission archive contract, explicit archive-era error handling]
key-files:
  created: []
  modified:
    - lib/mission-control.ts
    - lib/mission-control-mutations.ts
    - app/api/mission-control/intake/route.ts
    - app/api/mission-control/tasks/[taskId]/route.ts
    - app/page.tsx
    - components/mission-control-panel.tsx
key-decisions:
  - "Moved mission-control runtime defaults to ~/.openclaw/mission-control while keeping legacy env names as compatibility aliases."
  - "Returned 410 for legacy remote repo-task mutations so the retired bridge fails clearly instead of proxying hidden old behavior."
patterns-established:
  - "Mission Control runtime ownership is local-first and archive-era, not a passthrough into retired repo-task systems."
requirements-completed: [ARCH-01, ARCH-03]
duration: 32min
completed: 2026-03-16
---

# Phase 9: Plan 01 Summary

**Mission Control now reads and writes against a local archive-era contract, while retired remote repo-task mutations fail fast with explicit archive errors.**

## Performance

- **Duration:** 32 min
- **Started:** 2026-03-16T13:12:00Z
- **Completed:** 2026-03-16T13:44:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Replaced Launchpad-named default runtime paths with a local mission archive contract under `~/.openclaw/mission-control`.
- Rebuilt the bundled Mission Control sample so it no longer models repo-bound Launchpad-era work.
- Archived the legacy remote repo-task bridge with explicit `410` route responses and kept the UI in local mutation mode.

## Task Commits

Implementation stayed local in one exec-mode pass with no git commits created during plan execution.

## Files Created/Modified

- `lib/mission-control.ts` - Swaps the runtime defaults and bundled sample data to the archive-era model.
- `lib/mission-control-mutations.ts` - Points local mutations and advisory artifact roots at the mission archive home.
- `app/api/mission-control/intake/route.ts` - Archives the remote intake bridge with a clear `410` error.
- `app/api/mission-control/tasks/[taskId]/route.ts` - Archives remote task mutation passthrough with a clear `410` error.
- `app/page.tsx` - Forces Mission Control into local mutation mode for the post-archive contract.
- `components/mission-control-panel.tsx` - Aligns panel actions with the local-only mutation path.

## Decisions Made

- Kept legacy env names readable as compatibility aliases so existing local setups do not break immediately.
- Preserved the Mission Control data shape for downstream phases while changing the ownership source and fallback semantics underneath it.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `next dev` would not allow a second concurrent instance for remote-bridge verification, so the legacy-env `410` check used `pnpm start` on a second port instead.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 10 can consume the same Mission Control snapshot fields without inheriting the retired remote repo-task bridge.

---
*Phase: 09-archive-legacy-repo-task-systems*
*Completed: 2026-03-16*
