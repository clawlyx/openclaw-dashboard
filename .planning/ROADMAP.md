# Roadmap: OpenClaw Dashboard

## Archived Milestones

- [v1.3.0 Operator Intelligence](milestones/v1.3.0-ROADMAP.md) — shipped 2026-03-15, 3 phases, 6 plans, 18 tasks
- [v1.2.0 Explicit Ownership Workstation](milestones/v1.2.0-ROADMAP.md) — shipped 2026-03-14, 4 phases, 8 plans, 23 tasks

## Overview

This roadmap defines the `v1.4.0 Agent Clarity` milestone. The goal is to make the Agents view dramatically easier to scan by separating Working / Blocked / Idle states, surfacing lightweight next-task suggestions for idle agents, and improving blocked-agent emphasis without moving task ownership truth out of Mission Control.

## Phases

**Phase Numbering:**
- Integer phases (8, 9, 10): Planned milestone work
- Decimal phases (8.1, 8.2): Urgent insertions if needed later

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 8: Agent Clarity** - Redesign the Agents surface around fast roster legibility, blocked/idle triage, and lightweight next-task suggestions. Completed 2026-03-16.

## Phase Details

### Phase 8: Agent Clarity
**Goal**: Make the Agents view roster-first and immediately scannable by grouping working, blocked, and idle agents clearly, emphasizing intervention needs, and surfacing lightweight next-task hints for idle agents.
**Depends on**: Phase 7 archived milestone
**Requirements**: [AGENT-01, AGENT-02, AGENT-03, TRIAGE-01, TRIAGE-02, TRIAGE-03, IDLE-01, IDLE-02, IDLE-03, QUEUE-01, QUEUE-02, QUEUE-03, BLOCK-01, BLOCK-02, BLOCK-03, RESP-01, RESP-02, RESP-03]
**Success Criteria** (what must be TRUE):
  1. Operators can tell who is working, blocked, or idle within a few seconds of opening the Agents view.
  2. Blocked agents expose enough reason and time context to make intervention needs obvious without opening Mission Control first.
  3. Idle agents show credible lightweight next-task hints and a compact idle-assignment queue without pretending the system is auto-assigning work.
  4. The responsive layout preserves the same Working / Blocked / Idle mental model across desktop and smaller screens.
**Plans**: 1 plan

Plans:
- [x] 08-01: Rebuild the Agents view around roster clarity, blocked emphasis, and idle suggestion flow

## Progress

**Execution Order:**
Phases execute in numeric order: 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 8. Agent Clarity | 1/1 | Complete | 2026-03-16 |
