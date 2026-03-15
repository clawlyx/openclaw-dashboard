---
phase: 05-historical-signal-foundation
plan: 01
subsystem: snapshot-model
tags: [mission-control, timeline, pressure, history, metrics]
requires:
  - phase: 04-pressure-signals
    provides: explainable current-pressure signals and explicit ownership groundwork
provides:
  - normalized task and feature timeline records in Mission Control snapshots
  - reusable historical signal metrics for age, review wait, blocked duration, and activity gaps
  - fallback-safe history source labels distinguishing full history from partial or current-only data
affects: [mission-control-snapshot, pressure-derivation, api-snapshot]
tech-stack:
  added: []
  patterns:
    - timeline history normalized once in the snapshot layer and reused by pressure helpers
key-files:
  created: []
  modified:
    - lib/mission-control.ts
    - lib/pressure-signals.ts
key-decisions:
  - "Preserve normalized task and feature timelines in the Mission Control snapshot instead of re-deriving raw history ad hoc in each UI surface."
  - "Use explicit history source labels so later views can tell full history, partial history, and current-only fallback apart."
  - "Infer review and blocked transitions from existing Launchpad history lines when explicit task history is missing."
patterns-established:
  - "Historical metrics are derived in lib/pressure-signals.ts and can be consumed without mutating queue truth or ownership truth."
requirements-completed:
  - HIST-01
  - HIST-02
duration: 1 session
completed: 2026-03-14
---

# Phase 5: Historical Signal Foundation Summary

**Mission Control snapshots now preserve timeline records and expose reusable historical metrics**

## Performance

- **Duration:** 1 session
- **Started:** 2026-03-14T20:40:00-04:00
- **Completed:** 2026-03-14T21:08:00-04:00
- **Tasks:** 3
- **Files modified:** 2
- **Files created:** 0

## Accomplishments

- Added normalized `history` and `historySource` fields to Mission Control feature and task snapshots.
- Preserved feature history entries, accepted task-level history when present, and derived timestamp-based fallback entries from `startedAt`, `lastWorkedAt`, and `updatedAt`.
- Taught the snapshot layer to infer task status transitions from existing Launchpad history phrases such as review, block, ready, and release events.
- Added reusable historical signal metrics in `lib/pressure-signals.ts` for active age, activity gap, current wait, review wait, and blocked duration, plus room-level historical aggregates.
- Switched the current pressure logic to use those derived historical metrics rather than only `lastWorkedAt` heuristics.

## Task Commits

All execution tasks landed in the same scoped feature commit:

1. **Task 1: Extend mission snapshots with timeline-safe historical records** - `c074bd4` (feat)
2. **Task 2: Build reusable historical signal derivation helpers** - `c074bd4` (feat)
3. **Task 3: Prove fallback-safe behavior for partial timelines** - `c074bd4` (feat)

**Plan metadata:** `cd19bee` (docs)

## Files Created/Modified

- `lib/mission-control.ts` - Adds normalized history entries, source labels, timestamp-derived fallback records, and history-aware task parsing.
- `lib/pressure-signals.ts` - Adds reusable historical metrics for tasks and rooms, then reuses them in the pressure model.

## Decisions Made

- Kept historical metrics separate from alert output so later intelligence surfaces can render trend data without rewriting queue logic.
- Treated missing explicit task history as a first-class fallback state rather than silently pretending every task has full historical coverage.

## Deviations from Plan

None. The slice stayed inside the snapshot and derivation layers, leaving UI-heavy intelligence surfaces for later plans.

## Issues Encountered

- The repo already had a running `next dev` instance holding the dev lock, so runtime validation used a built `pnpm start` instance on an isolated port instead of a second dev server.

## User Setup Required

None.

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- Built-app verification on `http://127.0.0.1:3405/api/snapshot` confirming:
  - feature `history` and `historySource` fields are present
  - task `history` and `historySource` fields are present
  - sparse task timelines correctly report `current-only` fallback

## Next Phase Readiness

- Plan `05-02` can now thread historical metrics into room and mission view models without inventing new parser logic.
- The office UI can safely distinguish current pressure from historical context because the source labels and derived metrics already exist.

---
*Phase: 05-historical-signal-foundation*
*Completed: 2026-03-14*
