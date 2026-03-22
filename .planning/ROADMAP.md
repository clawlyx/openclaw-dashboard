# Roadmap: OpenClaw Dashboard

## Current Milestone

**Version:** `v1.6.0`
**Name:** `Evidence-Based Forecasting`
**Status:** In progress as of 2026-03-21
**Phases:** `14-16`
**Requirements:** `9`

## Overview

`v1.6.0 Evidence-Based Forecasting` turns the coordination clarity shipped in `1.5.0` into forward-looking, inspectable signal. The milestone focuses on forecasting likely slippage across the existing `Agents` and `Mission Control` surfaces, showing why a forecast exists and how trustworthy it is, and keeping every forecast advisory instead of sounding like automatic assignment.

## Phase Summary

| Phase | Name | Goal | Requirements | Success Criteria |
|-------|------|------|--------------|------------------|
| 14 | Early-Warning Signal Contract | Forecast likely coordination slippage from the existing snapshot and recent history | FORE-01, FORE-02, FORE-03 | 4 |
| 15 | Forecast Views on Existing Surfaces | Surface inspectable forecasted risk in `Agents` and `Mission Control` without adding a new workspace | SURF-01, SURF-02, SURF-03 | 4 |
| 16 | Trustworthy Forecast Guidance | Keep forecasting advisory, confidence-aware, and verifiable across API, demo, UI, and docs | TRST-01, TRST-02, TRST-03 | 4 |

## Phases

### Phase 14: Early-Warning Signal Contract

**Goal**: Operators can see which coordination issue is likely to slip next, why the model thinks so, and how trustworthy that forecast is.
**Depends on**: Phase 13 shipped baseline from `v1.5.0`
**Requirements**: `FORE-01`, `FORE-02`, `FORE-03`

Success criteria:
1. The shared snapshot contract exposes one ranked set of forecast candidates grounded in current coordination plus recent pressure or handoff evidence.
2. Each forecast carries compact evidence that explains which overlap, handoff, queue, room, or mission signals made it rise.
3. Forecast output includes confidence-aware fallback states so weak evidence does not read like confident prediction.
4. The contract remains local-first and explainable, with no external scoring service or hidden backend dependency.

### Phase 15: Forecast Views on Existing Surfaces

**Goal**: Operators can inspect forecasted risk from the default `Agents` and `Mission Control` paths without opening a new coordination workspace.
**Depends on**: Phase 14
**Requirements**: `SURF-01`, `SURF-02`, `SURF-03`

Success criteria:
1. The default `Agents` scan path surfaces the highest-value forecast in a way that reads as near-term risk, not current incident.
2. `Mission Control` can reflect forecast context from `Agents` while preserving its role as task-truth destination.
3. Forecast items link into the relevant `Agents` or `Mission Control` context without losing the mapping, overlap, or handoff cues already established in `1.5.0`.
4. Forecasted issues stay visually distinct from active pressure so operators can triage "act now" versus "watch next" correctly.

### Phase 16: Trustworthy Forecast Guidance

**Goal**: Forecast guidance stays advisory, confidence-aware, and verifiable across shared API, demo, docs, and runbooks.
**Depends on**: Phase 15
**Requirements**: `TRST-01`, `TRST-02`, `TRST-03`

Success criteria:
1. Forecast wording always makes uncertainty explicit and never sounds like guaranteed outcome or hidden staffing automation.
2. `/api/snapshot`, bundled demo scenarios, and the UI all expose the same forecast states so one contract drives implementation and verification.
3. The repo documents a repeatable validation flow for strong forecast, watch forecast, and insufficient-evidence cases.
4. The milestone closes without introducing a new workspace, runtime control surface, or ownership ambiguity.

## Delivery Notes

- Research is intentionally skipped for this milestone because the work builds directly on the existing local coordination model rather than a new domain expansion.
- Forecasts must remain explainable, evidence-based, and visibly advisory; fake certainty is a product bug.
- `Agents` and `Mission Control` remain the only coordination surfaces in scope for `v1.6.0`.
- Runtime controls, channel delivery state, and any dedicated expansion surface remain deferred until forecasting proves they are necessary.

## Archived Milestones

- [v1.5.0 Coordination Clarity](milestones/v1.5.0-ROADMAP.md) — shipped 2026-03-21, phases 11-13
- [v1.4.0 Agent Clarity](milestones/v1.4.0-ROADMAP.md) — shipped 2026-03-16, phases 8-10
- [v1.3.0 Operator Intelligence](milestones/v1.3.0-ROADMAP.md) — shipped 2026-03-15, phases 5-7
- [v1.2.0 Explicit Ownership Workstation](milestones/v1.2.0-ROADMAP.md) — shipped 2026-03-14, phases 1-4

## Next Step

Run `$gsd-plan-phase 14` to start execution planning for `v1.6.0 Evidence-Based Forecasting`.
