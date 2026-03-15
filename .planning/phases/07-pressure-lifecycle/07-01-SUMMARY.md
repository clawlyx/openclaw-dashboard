---
phase: 07-pressure-lifecycle
plan: 01
subsystem: agents-ui
tags: [agents, lifecycle, pressure, snapshot, i18n]
requires:
  - phase: 06-intelligence-surfaces
    provides: operator summary, bottleneck ranking, scoped room intelligence
provides:
  - shared pressure lifecycle state in the dashboard snapshot
  - lifecycle-aware operator summary, bottleneck, room, mission, and detail cues
  - bilingual lifecycle copy for explainable slipping, sustained, and recovering states
affects: [snapshot, virtual-office, operator-summary, detail-drawer, i18n]
tech-stack:
  added: []
  patterns:
    - lifecycle reasoning is derived from visible status transitions and wait/age data instead of a hidden replacement score
key-files:
  created: []
  modified:
    - lib/pressure-signals.ts
    - lib/openclaw.ts
    - lib/mission-control.ts
    - components/agents-virtual-office-panel.tsx
    - locales/en.json
    - locales/zh.json
key-decisions:
  - "Expose the pressure lifecycle model from `/api/snapshot` so the API and UI share the same reasoning payload."
  - "Classify long-running pressure as sustained before recent worsening so old review queues do not keep reading as fresh slips."
  - "Use localized lifecycle summaries in the UI while still emitting plain English reason text in the snapshot contract for verification."
patterns-established:
  - "Operator summary, room intelligence, mission cards, detail drawers, and pressure rails all consume the same lifecycle model."
requirements-completed:
  - HIST-03
  - ROOM-03
  - OPER-03
duration: 1 session
completed: 2026-03-15
---

# Phase 7: Pressure Lifecycle Summary

**The workstation now explains whether pressure is new, sustained, slipping, or recovering from the same shared snapshot model**

## Performance

- **Duration:** 1 session
- **Started:** 2026-03-15T10:30:00-04:00
- **Completed:** 2026-03-15T12:40:00-04:00
- **Tasks:** 3
- **Files modified:** 6
- **Files created:** 0

## Accomplishments

- Added lifecycle classification, trend metadata, and reason text to task and room pressure metrics inside the shared pressure model.
- Exposed the same lifecycle payload through `DashboardSnapshot.pressure`, which also flows to `/api/snapshot`.
- Updated the `Agents` virtual office to show lifecycle-aware summary cards, bottleneck reasons, mission card summaries, room trend copy, and detail-drawer evidence.
- Added English and Chinese lifecycle labels plus localized lifecycle explanation templates.
- Refreshed the bundled Mission Control sample timeline so demo mode shows slipping build pressure, sustained release review pressure, and recovering research work.

## Files Created/Modified

- `lib/pressure-signals.ts` - Adds lifecycle state, trend, reason text, and room aggregation logic.
- `lib/openclaw.ts` - Threads the shared pressure payload into the dashboard snapshot contract.
- `lib/mission-control.ts` - Refreshes bundled sample task timelines to prove slipping, sustained, and recovering cases in demo mode.
- `components/agents-virtual-office-panel.tsx` - Surfaces lifecycle cues across summary, bottleneck, room, mission, rail, and detail views.
- `locales/en.json` - Adds English lifecycle labels and explanation templates.
- `locales/zh.json` - Adds Chinese lifecycle labels and explanation templates.

## Deviations from Plan

- `app/globals.css` did not need dedicated changes because the existing operator-summary and card styling already supported the new lifecycle copy density cleanly.

## Issues Encountered

- Long-running review pressure initially read as `slipping`; the classifier was reordered so older unresolved pressure settles into `sustained` while only fresh deterioration stays `slipping`.

## User Setup Required

None.

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- Browser-verified demo `/?view=agents&panel=virtual&lang=en` showing:
  - `Build Bay` / `TQ-108` as `slipping`
  - `Review Booth` / `TQ-097` as `sustained`
  - `Research Bay` / `TQ-101` as `recovering`
  - lifecycle label + lifecycle reason in the shared detail drawer
- API-verified `/api/snapshot` showing matching lifecycle states under `pressure.taskMetricsByTaskId` and room lifecycle states under `pressure.roomMetricsByRoomId`

## Next Phase Readiness

- `07-02` can now package the milestone with demo-safe fixtures, refreshed screenshots, and release documentation using the finalized lifecycle behavior.

---
*Phase: 07-pressure-lifecycle*
*Completed: 2026-03-15*
