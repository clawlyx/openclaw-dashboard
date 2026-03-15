---
phase: 06-intelligence-surfaces
plan: 02
subsystem: agents-ui
tags: [agents, operator-intelligence, summary, bottlenecks, scope]
requires:
  - phase: 06-intelligence-surfaces
    provides: room intelligence comparison, scoped filters, and room hotness explanations
provides:
  - first-load operator summary cards for hottest mission, critical room, and next intervention
  - scoped bottleneck ranking tied to the same room and mission filters as room intelligence
  - localized operator-intelligence copy integrated into the office panel
affects: [virtual-office, operator-summary, bottleneck-ranking, i18n]
tech-stack:
  added: []
  patterns:
    - first-load summary surfaces derive from the same visible pressure and history metrics as deeper office rails
key-files:
  created: []
  modified:
    - components/agents-virtual-office-panel.tsx
    - app/globals.css
    - locales/en.json
    - locales/zh.json
key-decisions:
  - "Keep the operator summary inside the office panel so first-load triage and deeper inspection remain one workflow."
  - "Rank bottlenecks with explainable visible metrics rather than a hidden score-only model."
  - "Reuse the existing intelligence scope controls instead of inventing a separate summary-only filter model."
patterns-established:
  - "Top-of-panel summary cards can drive focus changes into room and mission detail without leaving the office view."
requirements-completed:
  - OPER-01
  - OPER-02
duration: 1 session
completed: 2026-03-14
---

# Phase 6: Intelligence Surfaces Summary

**The workstation now answers what is slipping on first load, then lets the operator drill into the same scoped bottlenecks**

## Performance

- **Duration:** 1 session
- **Started:** 2026-03-14T22:10:00-04:00
- **Completed:** 2026-03-14T22:48:00-04:00
- **Tasks:** 3
- **Files modified:** 4
- **Files created:** 1

## Accomplishments

- Added an `Operator summary` rail with top cards for the hottest mission, the most critical room, and the next intervention target.
- Added a `Bottleneck ranking` surface that orders tasks by visible blocked, review-wait, age, activity-gap, and room-pressure signals.
- Kept summary and bottleneck surfaces aligned with the same all-work, room, and mission scopes as the room intelligence rail.
- Added English and Chinese copy plus styling for the new operator-intelligence panels.

## Task Commits

All execution tasks landed in the same scoped feature commit:

1. **Task 1: Build an operator summary layer for hottest work** - `944ee9a`
2. **Task 2: Rank bottlenecks using explainable signals** - `944ee9a`
3. **Task 3: Localize and verify the intelligence summary surfaces** - `944ee9a`

**Wave 1 feature commit:** `1d90ab2` (feat)

## Files Created/Modified

- `components/agents-virtual-office-panel.tsx` - Adds the operator summary cards, scoped bottleneck ranking, and focus routing into room and mission detail.
- `app/globals.css` - Styles the new operator summary and bottleneck surfaces for desktop and focused-room layouts.
- `locales/en.json` - Adds English operator summary and bottleneck copy.
- `locales/zh.json` - Adds Chinese operator summary and bottleneck copy.

## Decisions Made

- Treated bottleneck ranking as a visible prioritization aid, not a hidden analytics score, by surfacing the exact reasons on every card.
- Reused the same scope state for both room and operator intelligence so the office stays coherent when focus changes.

## Deviations from Plan

- `app/page.tsx` did not need changes because the existing office panel shell already had the right placement and generated-at inputs for the new summary layer.

## Issues Encountered

- The repo's local `.env` points the dashboard runner at occupied default ports, so browser verification used an explicit `DASHBOARD_URL=http://127.0.0.1:3410` demo run.

## User Setup Required

None.

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- Browser-verified demo `/?view=agents&panel=virtual&lang=en` showing:
  - first-load `Operator summary` cards for hottest mission, critical room, and next intervention
  - `Bottleneck ranking` cards with explainable blocked, review-wait, age, and signal reasons
  - clicking the critical room summary focuses `Build Bay`
  - mission scope collapses the summary and bottleneck surfaces to the selected mission context

## Next Phase Readiness

- Phase 7 can now focus on whether pressure is worsening or recovering instead of basic prioritization and scoping.
- The workstation already answers the core operator question of what needs intervention next on first load.

---
*Phase: 06-intelligence-surfaces*
*Completed: 2026-03-14*
