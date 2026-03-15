# Roadmap: OpenClaw Dashboard

## Archived Milestones

- [v1.2.0 Explicit Ownership Workstation](milestones/v1.2.0-ROADMAP.md) — shipped 2026-03-14, 4 phases, 8 plans, 23 tasks

## Overview

This milestone turns the workstation into an operator-intelligence surface. The work starts by building historical signal foundations, then adds room and mission intelligence views, and finishes by making pressure lifecycle and trend direction readable without hiding current-state truth.

## Phases

- [ ] **Phase 5: Historical Signal Foundation** - Capture and derive time-aware mission history so the workstation can reason about aging and wait durations
- [ ] **Phase 6: Intelligence Surfaces** - Add room and operator summary surfaces that expose hot spots, throughput, and bottlenecks
- [ ] **Phase 7: Pressure Lifecycle** - Explain whether pressure is new, ongoing, or improving, then package the milestone safely

## Phase Details

### Phase 5: Historical Signal Foundation
**Goal:** Add the history model needed to show aging and wait-time trends without breaking live fallback behavior.
**Depends on:** Phase 4 archived milestone
**Requirements:** [HIST-01, HIST-02]
**Success Criteria** (what must be TRUE):
  1. The workstation exposes historical aging and wait-duration data for active missions or rooms.
  2. Trend calculations remain readable when only partial historical fields are available.
  3. Current pressure and historical pressure stay clearly separated in the UI model.
**Plans:** 2 plans

Plans:
- [x] 05-01: Add historical signal derivation and timeline-safe snapshot shaping
- [ ] 05-02: Thread trend metrics into mission and room data models with fallback handling

### Phase 6: Intelligence Surfaces
**Goal:** Surface high-value operator intelligence on first load and in room-level comparison views.
**Depends on:** Phase 5
**Requirements:** [ROOM-01, ROOM-02, OPER-01, OPER-02]
**Success Criteria** (what must be TRUE):
  1. Operator can compare rooms by queue age, overload frequency, and throughput in one surface.
  2. Operator summary shows the hottest missions, review bottlenecks, and overloaded rooms without reading every card.
  3. Intelligence views can be scoped to all work, one room, or one mission.
**Plans:** 2 plans

Plans:
- [ ] 06-01: Build room intelligence comparison views and scoped detail surfaces
- [ ] 06-02: Add operator summary panels for hottest work and bottleneck ranking

### Phase 7: Pressure Lifecycle
**Goal:** Show whether pressure is worsening or improving and finish the milestone with safe demo assets and validation.
**Depends on:** Phase 6
**Requirements:** [HIST-03, ROOM-03, OPER-03]
**Success Criteria** (what must be TRUE):
  1. Operator can distinguish new pressure from long-running or improving pressure.
  2. Room and mission detail views explain why a signal is considered slipping or recovering.
  3. Demo data, screenshots, and docs reflect the intelligence milestone safely.
**Plans:** 2 plans

Plans:
- [ ] 07-01: Add pressure lifecycle states and improving-vs-worsening cues
- [ ] 07-02: Refresh demo data, docs, and validation assets for the milestone

## Progress

**Execution Order:**
Phases execute in numeric order: 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 5. Historical Signal Foundation | 1/2 | In progress | 05-01 |
| 6. Intelligence Surfaces | 0/2 | Not started | - |
| 7. Pressure Lifecycle | 0/2 | Not started | - |
