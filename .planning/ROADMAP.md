# Roadmap: OpenClaw Dashboard

## Overview

This milestone turns the current joined workstation into an explicit ownership console. The work starts by making ownership a first-class data contract, then layers on detail drawers, inline task actions, and pressure signals so the operator can understand and move work forward from the office view alone.

## Phases

- [x] **Phase 1: Ownership Contract** - Make mission ownership explicit in the snapshot contract and preserve labeled fallback behavior
- [x] **Phase 2: Detail Drawers** - Add room and agent drawers that answer what the owner is doing now, what happened last, and what is next
- [x] **Phase 3: Office Actions** - Reuse Mission Control mutations so the office surface can move supported tasks forward
- [x] **Phase 4: Pressure Signals** - Surface urgency and release the milestone with refreshed demo data and validation assets

## Phase Details

### Phase 1: Ownership Contract
**Goal:** Make explicit mission ownership and structured task references available to the dashboard without breaking existing fallback behavior.
**Depends on:** Nothing (first phase)
**Requirements:** [OWN-01, OWN-02, OWN-03, OWN-04]
**Requirements**: [OWN-01, OWN-02, OWN-03, OWN-04]
**Success Criteria** (what must be TRUE):
  1. `/api/snapshot` exposes explicit ownership metadata for at least one mission task in the happy path.
  2. Agent snapshots expose structured task references instead of relying only on free-text fields.
  3. Existing office surfaces still render when ownership metadata is missing, and the fallback path is visibly labeled as inferred.
**Plans:** 2 plans

Plans:
- [x] 01-01: Extend mission and agent snapshot types, readers, and demo data for explicit ownership fields
- [x] 01-02: Join explicit ownership into dashboard presenters and label inferred fallback in the office surface

### Phase 2: Detail Drawers
**Goal:** Add focused room and agent detail drawers that make current ownership and recent handoff context inspectable from the office view.
**Depends on:** Phase 1
**Requirements:** [DRAW-01, DRAW-02, DRAW-03]
**Requirements**: [DRAW-01, DRAW-02, DRAW-03]
**Success Criteria** (what must be TRUE):
  1. Clicking a room or agent opens a drawer tied to the exact mission owner context.
  2. The drawer shows current task, last completed task, next planned step, and blocker or waiting information.
  3. Mission queue cards, room cards, and desk cards route into the same focused detail surface.
**Plans:** 2 plans

Plans:
- [x] 02-01: Build drawer state, shell, and room/agent navigation wiring
- [x] 02-02: Populate drawer content with ownership details, handoff context, and artifact links

### Phase 3: Office Actions
**Goal:** Let the operator run supported Mission Control transitions from the office surface without losing server truth.
**Depends on:** Phase 2
**Requirements:** [ACT-01, ACT-02, ACT-03]
**Requirements**: [ACT-01, ACT-02, ACT-03]
**Success Criteria** (what must be TRUE):
  1. Supported actions can be triggered from the office surface for the active task.
  2. Unsupported transitions remain visible but disabled rather than disappearing.
  3. After a mutation, the office view matches the Mission Control workspace state.
**Plans:** 2 plans

Plans:
- [x] 03-01: Wire supported task mutations into office drawer and queue actions
- [x] 03-02: Refresh state from Mission Control truth and verify local and remote action flows

### Phase 4: Pressure Signals
**Goal:** Prioritize urgent work and package the milestone with refreshed demo data, docs, and acceptance coverage.
**Depends on:** Phase 3
**Requirements:** [PRES-01, PRES-02, PRES-03]
**Requirements**: [PRES-01, PRES-02, PRES-03]
**Success Criteria** (what must be TRUE):
  1. The office surface highlights stale review, blocked-too-long, waiting-on-human, and no-owner states.
  2. Attention ordering and room overload cues make the highest urgency work obvious.
  3. Demo data, screenshots, and validation docs reflect the explicit ownership milestone safely.
**Plans:** 2 plans

Plans:
- [x] 04-01: Add pressure heuristics, scoring, and attention ordering to the office surface
- [x] 04-02: Refresh demo data, docs, screenshots, and release validation for `1.2.0`

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Ownership Contract | 2/2 | Complete | 2026-03-14 |
| 2. Detail Drawers | 2/2 | Complete | 2026-03-14 |
| 3. Office Actions | 2/2 | Complete | 2026-03-14 |
| 4. Pressure Signals | 2/2 | Complete | 2026-03-14 |
