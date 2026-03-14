---
phase: 04-pressure-signals
plan: 01
subsystem: agents-ui
tags: [agents, mission-control, pressure, office, priority]
requires:
  - phase: 03-office-actions
    provides: shared mission focus, queue rail, and office drawer task context
provides:
  - reusable pressure scoring derived from snapshot data
  - mission-aware pressure rail with focus routing
  - room and queue pressure cues across the office surface
affects: [attention-rail, room-cues, mission-queue, summary-cards]
tech-stack:
  added: []
  patterns:
    - pressure model isolated in a helper and threaded into UI as derived state
key-files:
  created:
    - lib/pressure-signals.ts
  modified:
    - components/agents-virtual-office-panel.tsx
    - app/page.tsx
    - app/globals.css
    - locales/en.json
    - locales/zh.json
key-decisions:
  - "Use the snapshot generatedAt timestamp as the stable age anchor so pressure scoring stays deterministic across hydration."
  - "Upgrade the old blocked-desk rail into a mixed pressure rail that routes to tasks, agents, or rooms instead of showing disconnected alerts."
  - "Keep pressure explainable: severity comes from visible task age, waiting state, ownership, and room load rather than hidden heuristics."
patterns-established:
  - "Office UI surfaces can consume one pressure helper for counts, ordering, and badge severity instead of re-implementing alert logic inline."
requirements-completed:
  - PRES-01
  - PRES-02
duration: 1 session
completed: 2026-03-14
---

# Phase 4: Pressure Signals Summary

**The Agents workspace now scores and surfaces mission pressure directly from snapshot truth**

## Performance

- **Duration:** 1 session
- **Started:** 2026-03-14T18:10:00-04:00
- **Completed:** 2026-03-14T18:38:00-04:00
- **Tasks:** 3
- **Files modified:** 6
- **Files created:** 1

## Accomplishments

- Added a dedicated pressure helper that derives stale-review, blocked-too-long, waiting-human, inferred-owner, and room-overload signals from the current agents and Mission Control snapshots.
- Threaded stable `generatedAt` timing from the server page into the office surface so age-based pressure stays deterministic.
- Reworked the office summary cards, room pulse grid, mission queue cards, and attention rail to use the shared pressure model rather than separate blocked-desk counters.
- Added severity badges, room pressure counts, and localized copy for the new operator language in English and Chinese.

## Task Commits

All execution tasks landed in the same scoped feature commit:

1. **Task 1: Build a reusable pressure-signal model** - `1082566` (feat)
2. **Task 2: Upgrade the office attention surface** - `1082566` (feat)
3. **Task 3: Localize and verify the new signal language** - `1082566` (feat)

**Plan metadata:** `25c9f9b` (docs)

## Files Created/Modified

- `lib/pressure-signals.ts` - Centralizes pressure derivation, room priority scoring, and task or room severity lookup.
- `components/agents-virtual-office-panel.tsx` - Swaps the old blocked-desk rail for pressure cards, adds room pressure cues, and prioritizes queue tasks with active pressure.
- `app/page.tsx` - Passes the snapshot-generated timestamp into the office surface.
- `app/globals.css` - Styles severity badges, room pressure accents, and clickable pressure items.
- `locales/en.json` - Adds English pressure labels, severity copy, and aging text.
- `locales/zh.json` - Adds Chinese pressure labels, severity copy, and aging text.

## Decisions Made

- Kept room overload as a first-class pressure signal so the operator can spot overloaded rooms even when no single task is selected.
- Treated inferred ownership as pressure only when Mission Control does not provide an explicit owner, instead of guessing from room labels alone.

## Deviations from Plan

None - plan executed as scoped.

## Issues Encountered

- The first browser pass hit live custom Launchpad data, which was not reliable for full pressure coverage. Final verification switched to a disposable temp `AGENT_LAUNCHPAD_HOME` plus bundled demo agents so every required pressure state was exercised deterministically.

## User Setup Required

None - verification used bundled demo agent data and a disposable temp Launchpad state file.

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- Browser-verified pressure rail on `/?view=agents&panel=virtual&lang=en` with a disposable temp Launchpad state showing:
  - stale review
  - blocked too long
  - waiting on human
  - inferred ownership
- Browser-verified room-level pressure cues in the room pulse grid
- Browser-verified pressure-card click focusing the owning room or task drawer

## Next Phase Readiness

- Wave 1 is complete. Wave 2 can refresh the bundled demo Mission Control state, public screenshots, and release metadata without revisiting the office pressure model.
- The pressure helper now gives the release pass a stable source for screenshot-safe pressure cues and `1.2.0` documentation.

---
*Phase: 04-pressure-signals*
*Completed: 2026-03-14*
