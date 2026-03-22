---
phase: 13-default-coordination-guidance
plan: 01
subsystem: api
tags: [agents, coordination, recommendations, snapshot, demo]
requires:
  - phase: 12-overlap-and-handoff-visibility
    provides: overlap groups, handoff summaries, and Mission Control routing context reused by the selector
provides:
  - additive recommendation metadata with an explicit calm fallback
  - severity-first ranking across overlap, handoff, and mapping evidence
  - deterministic bundled demo recommendation states without predictive behavior
affects: [agents, mission-control, demo-data, verification]
tech-stack:
  added: []
  patterns: [server-owned recommendation ranking, additive snapshot metadata, deterministic demo transforms]
key-files:
  created: []
  modified:
    - lib/agents.ts
    - lib/openclaw.ts
key-decisions:
  - "Kept recommendation derivation on the server so every surface consumes one ranked advisory signal instead of recreating ranking logic in the browser."
  - "Returned an explicit `calm` state when no intervene or watch case remains so the UI does not manufacture urgency."
patterns-established:
  - "Recommendation payloads stay advisory and never redefine Mission Control ownership truth."
  - "Bundled demo variants are produced through selector transforms rather than separate predictive sample datasets."
requirements-completed: [NEXT-01, NEXT-02, NEXT-03]
duration: 14min
completed: 2026-03-21
---

# Phase 13: Default Coordination Guidance Summary

**The shared dashboard snapshot now ranks one trustworthy next move from existing coordination evidence and exposes a calm fallback when no action deserves escalation.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-03-20T23:18:00-04:00
- **Completed:** 2026-03-20T23:32:00-04:00
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Added a typed recommendation contract to the Agents snapshot with destination surface, target context, action type, and concise reason.
- Built a deterministic selector that prefers `intervene`, falls back to the strongest `watch` case, and returns `calm` when only routine coordination remains.
- Added bundled demo recommendation variants through the existing server transforms so urgent, watch-only, and calm states stay repeatable in verification.

## Task Commits

Implementation stayed local in one exec-mode pass; no per-task commits were created for this plan.

_Override:_ The requested phase execution ran locally in one agent pass with verification before phase close-out, so plan progress is recorded through the summary and verification artifacts instead of incremental task commits.

## Files Created/Modified

- `lib/agents.ts` - Adds the additive recommendation types, normalization, and snapshot finalization support.
- `lib/openclaw.ts` - Ranks existing overlap and handoff evidence into one recommendation and exposes deterministic demo recommendation scenarios.

## Decisions Made

- Reused Phase 12 overlap, handoff, and Mission Control mapping evidence instead of introducing a second coordination model.
- Kept exact-target confidence explicit so Mission Control destinations only claim precision when the current evidence supports it.
- Preserved bundled demo safety by transforming existing demo state in code instead of inflating the static sample payload.

## Deviations from Plan

None - plan executed as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Agents panels can now consume one shared, already-ranked recommendation without duplicating selector logic.
- Phase 13 UI and Mission Control continuity work can rely on stable intervene, watch, and calm demo states during browser verification.

---
*Phase: 13-default-coordination-guidance*
*Completed: 2026-03-21*
