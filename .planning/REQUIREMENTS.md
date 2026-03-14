# Requirements: OpenClaw Dashboard 1.2.0

**Defined:** 2026-03-14
**Core Value:** One workstation should let the operator see who owns work, what needs action next, and move the mission forward without switching apps.

## v1 Requirements

Current milestone: explicit ownership and office actions.

### Ownership Contract

- [x] **OWN-01**: Mission Control task snapshots expose `ownerAgentId`, `ownerRoomId`, `startedAt`, `lastWorkedAt`, `nextPlannedStep`, `blockedReason`, and `waitingOn`
- [x] **OWN-02**: Agent snapshots expose structured task references for `currentTaskId`, `lastTaskId`, and `nextTaskId`
- [x] **OWN-03**: The dashboard join layer distinguishes explicit ownership from inferred fallback instead of silently treating inference as ground truth
- [x] **OWN-04**: Bundled demo data and `/api/snapshot` include at least one explicit-ownership example safe for public screenshots and README assets

### Detail Surfaces

- [x] **DRAW-01**: Operator can open a room drawer from the office view and see owner room, owner agent, current task, last completed task, next step, and blocker or waiting reason
- [x] **DRAW-02**: Operator can open an agent drawer from desk cards or mission queue cards and stay scoped to the exact owner context
- [x] **DRAW-03**: Detail drawers surface recent handoff context and linked artifacts when those links are available

### Office Actions

- [ ] **ACT-01**: Office surfaces can trigger supported `advance` and `ready` transitions for the selected task
- [ ] **ACT-02**: Office surfaces can trigger supported `block` and `request review` transitions for the selected task
- [ ] **ACT-03**: After an office action, the UI refreshes from Mission Control truth and matches the Mission Control workspace state

### Pressure Signals

- [ ] **PRES-01**: Office surfaces highlight stale review, blocked-too-long, no-owner, and waiting-on-human pressure states
- [ ] **PRES-02**: Room overload and attention ordering surface the highest urgency work first
- [ ] **PRES-03**: Fallback mode remains readable when explicit ownership fields are missing on live data

## v2 Requirements

### Operator Intelligence

- **OPS-01**: Office surfaces show richer per-agent activity timelines beyond the current task snapshot
- **OPS-02**: The workstation exposes SLA-style metrics for handoff duration and queue aging across rooms

### Broader Control Surface

- **CTRL-01**: Host runtime controls for OpenClaw services and background workers appear inside the workstation
- **CTRL-02**: Multi-user or shared-operator views allow remote teammates to collaborate inside the same workstation

## Out of Scope

| Feature | Reason |
|---------|--------|
| Replace Agent Launchpad persistence | Launchpad remains the delivery source of truth |
| Add a second task database inside this repo | Would create drift between workstation and mission system |
| Control host processes from the dashboard | Not required for explicit ownership milestone |
| Build shared multi-operator collaboration now | Adds product and auth complexity unrelated to current milestone |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| OWN-01 | Phase 1 | Complete |
| OWN-02 | Phase 1 | Complete |
| OWN-03 | Phase 1 | Complete |
| OWN-04 | Phase 1 | Complete |
| DRAW-01 | Phase 2 | Complete |
| DRAW-02 | Phase 2 | Complete |
| DRAW-03 | Phase 2 | Complete |
| ACT-01 | Phase 3 | Pending |
| ACT-02 | Phase 3 | Pending |
| ACT-03 | Phase 3 | Pending |
| PRES-01 | Phase 4 | Pending |
| PRES-02 | Phase 4 | Pending |
| PRES-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 after completing Phase 2 detail drawers*
