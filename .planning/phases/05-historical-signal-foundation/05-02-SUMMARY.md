---
phase: 05-historical-signal-foundation
plan: 02
subsystem: agents-ui
tags: [agents, mission-control, trends, office, demo-data]
requires:
  - phase: 05-historical-signal-foundation
    provides: history-aware task and room metrics from the snapshot layer
provides:
  - room-level trend snapshots in the office pulse grid
  - detail-drawer historical context for active age, review wait, blocked duration, and activity gap
  - bundled demo mission histories that exercise full-history and fallback-safe trend states
affects: [virtual-office, detail-drawer, demo-state, i18n]
tech-stack:
  added: []
  patterns:
    - lightweight UI hooks layered on top of the historical metrics contract without replacing current-state mission truth
key-files:
  created: []
  modified:
    - components/agents-virtual-office-panel.tsx
    - lib/mission-control.ts
    - locales/en.json
    - locales/zh.json
key-decisions:
  - "Keep Phase 5 UI conservative: expose trend snapshots and drawer metrics, but leave richer comparison surfaces for Phase 6."
  - "Use the bundled demo mission state to prove full-history review and blocked flows instead of depending on live private Launchpad data."
  - "Show timeline source labels directly in the drawer so operators know whether a metric comes from full history or fallback state."
patterns-established:
  - "Room cards and drawer panels can consume historical metrics without mutating mission ownership or pressure ordering logic."
requirements-completed:
  - HIST-01
  - HIST-02
duration: 1 session
completed: 2026-03-14
---

# Phase 5: Historical Signal Foundation Summary

**The office now exposes lightweight historical context from the new timeline model**

## Performance

- **Duration:** 1 session
- **Started:** 2026-03-14T21:10:00-04:00
- **Completed:** 2026-03-14T21:32:00-04:00
- **Tasks:** 3
- **Files modified:** 4
- **Files created:** 0

## Accomplishments

- Added room-level trend snapshots to the pulse grid so operators can see the hottest age, review-wait, blocked, or activity-gap signal for each room.
- Expanded the owner detail drawer with timeline source, active age, review wait, blocked duration, and activity gap for the focused mission.
- Refreshed the bundled Mission Control demo state so review and blocked tasks carry full histories while older tasks still show current-only fallback when appropriate.
- Added English and Chinese copy for the new historical trend language.

## Task Commits

All execution tasks landed in the same scoped feature commit:

1. **Task 1: Thread trend metrics into room and mission view models** - `15713b5` (feat)
2. **Task 2: Add lightweight fallback-safe trend cues** - `15713b5` (feat)
3. **Task 3: Refresh bundled demo data for trend coverage** - `15713b5` (feat)

**Foundation commit:** `c074bd4` (feat)  
**Wave 1 docs:** `4147259` (docs)

## Files Created/Modified

- `components/agents-virtual-office-panel.tsx` - Threads room and task historical metrics into room cards and the owner detail drawer.
- `lib/mission-control.ts` - Upgrades bundled sample mission tasks with explicit history for review, research, and blocked trend coverage.
- `locales/en.json` - Adds English copy for timeline-source and duration labels.
- `locales/zh.json` - Adds Chinese copy for timeline-source and duration labels.

## Decisions Made

- Kept the new room trend cue as a single compact sentence so the office cards remain scannable.
- Let the detail drawer carry the fuller metric breakdown rather than bloating every mission queue card.

## Deviations from Plan

- The existing `demo/openclaw-home/agents/dashboard.json` task references were already sufficient, so the demo refresh stayed in `lib/mission-control.ts` where the bundled Mission Control sample state actually lives.

## Issues Encountered

- The default local environment pointed at a custom source, so browser verification explicitly restarted the built app in demo mode with an isolated `AGENT_LAUNCHPAD_HOME`.

## User Setup Required

None.

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- Demo-mode `/api/snapshot` verification on `http://127.0.0.1:3405/api/snapshot` confirming:
  - `TQ-097` review task reports `historySource: full-history`
  - `TQ-108` blocked task reports `historySource: full-history`
  - older tasks still report `current-only` when only fallback timestamps exist
- Browser-verified demo `/?view=agents&panel=virtual&lang=en` showing:
  - room trend snapshot on Build Bay and Review Booth cards
  - mission queue focus routing into the detail drawer
  - detail drawer rows for timeline source, active age, review wait, blocked duration, and activity gap

## Next Phase Readiness

- Phase 6 can now build room comparison and operator summary surfaces on top of proven room and task historical metrics.
- The workstation already exposes the minimum operator-facing proof that the historical contract is working.

---
*Phase: 05-historical-signal-foundation*
*Completed: 2026-03-14*
