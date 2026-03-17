# Requirements: OpenClaw Dashboard v1.5.0

**Defined:** 2026-03-16
**Core Value:** One workstation should let the operator see who owns work, what needs action next, and move the mission forward without switching apps.
**Milestone Goal:** Make coordination across Agents and Mission Control easier to trust and faster to act on by clarifying task-to-agent mapping, overlap and handoff state, and the operator's next move without introducing new control surfaces.

## v1.5.0 Requirements

### Task-to-Agent Mapping

- [ ] **MAP-01**: Operator can see the current Mission Control task linked to a working agent when a live mapping exists.
- [ ] **MAP-02**: Operator can tell whether a shown task-to-agent mapping is exact, partial, or unavailable without mistaking it for ownership reassignment.
- [ ] **MAP-03**: Operator can open the relevant Mission Control context from the Agents coordination surface without manually searching for the task.

### Overlap and Handoffs

- [ ] **HAND-01**: Operator can see when multiple agents are serving the same mission or closely related work so intentional parallelism and accidental overlap are distinguishable.
- [ ] **HAND-02**: Operator can see recent handoff state for active work, including the last agent involved and the expected next owner or lane when that data exists.
- [ ] **HAND-03**: Operator can tell when overlap or handoff ambiguity needs intervention more urgently than routine parallel work.

### Operator Next Actions

- [ ] **NEXT-01**: Operator can see one clear recommended next action in the default Agents coordination surface for the current highest-priority coordination issue.
- [ ] **NEXT-02**: Operator can tell whether the recommended next action belongs in Agents or Mission Control before leaving the default scan path.
- [ ] **NEXT-03**: Operator can see concise reasoning for the recommended next action so the recommendation reads as trustworthy guidance instead of a guess.

## Future Requirements

### Forecasting

- **FORE-01**: Operator can see likely coordination bottlenecks before pressure escalates.
- **FORE-02**: Operator can see trend-based handoff risk across rooms or missions.

### Runtime Controls

- **CTRL-01**: Operator can start, stop, or restart host services and worker processes from the workstation.
- **CTRL-02**: Operator can see command outcomes and recovery state for host-control actions.

### Surface Expansion

- **SURF-01**: Operator can open deeper coordination analytics in a dedicated surface when the current Agents and Mission Control views are no longer sufficient.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Predictive bottleneck forecasting | Explicitly deferred by the `v1.5.0 Coordination Clarity` brief |
| Host service and worker-process controls | Explicitly deferred by the `v1.5.0 Coordination Clarity` brief |
| Dedicated net-new coordination workspace | Prioritize clarity on known Agents and Mission Control surfaces first |
| Task ownership truth moving into Agents | Mission Control remains the ownership system of record |
| Automatic assignment or autonomous staffing | Guidance must stay advisory and trustworthy |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MAP-01 | Phase 11 | Pending |
| MAP-02 | Phase 11 | Pending |
| MAP-03 | Phase 11 | Pending |
| HAND-01 | Phase 12 | Pending |
| HAND-02 | Phase 12 | Pending |
| HAND-03 | Phase 12 | Pending |
| NEXT-01 | Phase 13 | Pending |
| NEXT-02 | Phase 13 | Pending |
| NEXT-03 | Phase 13 | Pending |

**Coverage:**
- v1.5.0 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-16*
*Last updated: 2026-03-16 after roadmap creation*
