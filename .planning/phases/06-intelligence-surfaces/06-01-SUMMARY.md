---
phase: 06-intelligence-surfaces
plan: 01
subsystem: agents-ui
tags: [agents, intelligence, rooms, scope, comparison]
requires:
  - phase: 05-historical-signal-foundation
    provides: historical room and task metrics plus lightweight trend cues
provides:
  - room intelligence comparison surface
  - scoped intelligence filtering for all-work, room, and mission contexts
  - explicit room explanations grounded in trend and pressure metrics
affects: [virtual-office, room-intelligence, detail-drawer, i18n]
tech-stack:
  added: []
  patterns:
    - office comparison surfaces build directly on existing pressure and history models without a separate analytics route
key-files:
  created: []
  modified:
    - components/agents-virtual-office-panel.tsx
    - app/globals.css
    - locales/en.json
    - locales/zh.json
key-decisions:
  - "Keep the room intelligence surface inside the office panel so comparison, focus, and action stay in one operator context."
  - "Use simple explainable factors like queue age, blocked duration, review wait, and signal count instead of opaque ranking math."
  - "Let mission scope collapse to the owning room rather than inventing a second mission-only layout."
patterns-established:
  - "Intelligence scope controls can reuse the current focus model while changing how comparison surfaces are filtered."
requirements-completed:
  - ROOM-01
  - ROOM-02
  - OPER-02
duration: 1 session
completed: 2026-03-14
---

# Phase 6: Intelligence Surfaces Summary

**The office can now compare rooms, filter intelligence by scope, and explain why a room is hot**

## Performance

- **Duration:** 1 session
- **Started:** 2026-03-14T21:48:00-04:00
- **Completed:** 2026-03-14T22:09:00-04:00
- **Tasks:** 3
- **Files modified:** 4
- **Files created:** 0

## Accomplishments

- Added a `Room intelligence` rail that ranks rooms by explainable signals such as queue age, blocked duration, review wait, and current pressure count.
- Added scope controls for all work, current room, and current mission, all tied to the existing office focus model.
- Expanded the room drawer with a direct explanation of why the room is hot instead of relying on generic status labels.
- Added English and Chinese copy plus supporting styling for the new intelligence cards and scope bar.

## Task Commits

All execution tasks landed in the same scoped feature commit:

1. **Task 1: Add a room intelligence comparison surface** - `1d90ab2`
2. **Task 2: Add scoped intelligence filtering for room and mission focus** - `1d90ab2`
3. **Task 3: Expand room detail explanations and localized copy** - `1d90ab2`

## Files Created/Modified

- `components/agents-virtual-office-panel.tsx` - Adds the room intelligence rail, scope filtering, and room hotness explanations.
- `app/globals.css` - Styles the intelligence scope bar and room intelligence cards.
- `locales/en.json` - Adds English copy for room intelligence and explanation labels.
- `locales/zh.json` - Adds Chinese copy for room intelligence and explanation labels.

## Decisions Made

- Kept the comparison cards compact and action-oriented so the operator can click directly into a room from the ranking.
- Used a throughput hint as a lightweight room signal, not a formal productivity metric.

## Deviations from Plan

None.

## Issues Encountered

- ESLint flagged React Compiler memoization preservation for the new derived room lists, so the final implementation uses plain derived values instead of extra `useMemo` wrappers.

## User Setup Required

None.

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- Browser-verified demo `/?view=agents&panel=virtual&lang=en` showing:
  - `Room intelligence` comparison cards
  - scope switching from all work to current room
  - current mission scope button enabled when a focused mission exists
  - room drawer explanation for why Build Bay is hot

## Next Phase Readiness

- `06-02` can now add first-load operator summaries and bottleneck ranking on top of the same scoped intelligence state.

---
*Phase: 06-intelligence-surfaces*
*Completed: 2026-03-14*
