# Requirements: OpenClaw Dashboard 1.3.0

**Defined:** 2026-03-14
**Core Value:** One workstation should let the operator see who owns work, what needs action next, and move the mission forward without switching apps.

## v1 Requirements

Current milestone: operator intelligence.

### Historical Signals

- [ ] **HIST-01**: Operator can see task aging history for active missions instead of only the current pressure snapshot
- [ ] **HIST-02**: Operator can see review wait time and blocked duration trends for the current mission or room
- [ ] **HIST-03**: Demo and live fallback modes both keep historical metrics readable when some timeline fields are missing

### Room Intelligence

- [ ] **ROOM-01**: Operator can compare rooms by queue age, overload frequency, and throughput in one view
- [ ] **ROOM-02**: Operator can open a room detail view that explains why the room is considered hot, stale, or recovering
- [ ] **ROOM-03**: Operator can tell which room is slipping versus improving across recent snapshots

### Operator Summary

- [ ] **OPER-01**: Operator can see a concise summary of the hottest missions, reviews, and bottlenecks on first load
- [ ] **OPER-02**: Operator can filter intelligence surfaces to the current room, mission, or all work
- [ ] **OPER-03**: Operator can distinguish new pressure from long-running pressure without reading every task card

## v2 Requirements

### Forecasting

- **FORE-01**: Workstation predicts likely next bottlenecks based on recent trend direction
- **FORE-02**: Workstation highlights expected SLA breaches before they happen

### Runtime Control

- **CTRL-01**: Operator can control host services and worker processes from the workstation
- **CTRL-02**: Operator can approve or retry broader runtime operations without leaving the app

## Out of Scope

| Feature | Reason |
|---------|--------|
| Host/runtime control surface | Keep `1.3.0` focused on intelligence and prioritization, not broader machine control |
| Multi-user collaboration | Adds auth and product complexity unrelated to the next operator-leverage milestone |
| Machine-learned prioritization | Pressure and trend logic should remain explainable and auditable |
| Replacing Mission Control persistence | Launchpad remains the delivery source of truth |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HIST-01 | Phase 5 | Pending |
| HIST-02 | Phase 5 | Pending |
| HIST-03 | Phase 7 | Pending |
| ROOM-01 | Phase 6 | Pending |
| ROOM-02 | Phase 6 | Pending |
| ROOM-03 | Phase 7 | Pending |
| OPER-01 | Phase 6 | Pending |
| OPER-02 | Phase 6 | Pending |
| OPER-03 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 after initial milestone definition*
