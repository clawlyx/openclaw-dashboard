# Requirements: OpenClaw Dashboard v1.6.0 Evidence-Based Forecasting

**Defined:** 2026-03-21
**Core Value:** One workstation should let the operator see who owns work, what needs action next, and move the mission forward without switching apps.

## v1.6.0 Requirements

Requirements for the current milestone. Each maps to one roadmap phase.

### Forecast Signals

- [ ] **FORE-01**: Operator can see which mission, room, or coordination issue is most likely to slip next before it becomes active pressure.
- [ ] **FORE-02**: Operator can see what evidence is driving a forecast, including the relevant overlap, handoff, queue, or pressure trend inputs.
- [ ] **FORE-03**: Operator can tell whether forecast confidence is strong enough to act on or still too weak to trust.

### Forecast Surfacing

- [ ] **SURF-01**: Operator can inspect forecasted coordination risk from the existing `Agents` scan path without opening a new workspace.
- [ ] **SURF-02**: Operator can open the relevant `Agents` or `Mission Control` context from a forecasted risk item without losing task-truth boundaries.
- [ ] **SURF-03**: Operator can compare forecasted issues with current active pressure so near-term risk does not overshadow already-active incidents.

### Trustworthy Forecasting

- [ ] **TRST-01**: Forecasting stays explicitly advisory and uncertainty-aware instead of sounding like guaranteed outcome or automatic assignment.
- [ ] **TRST-02**: `/api/snapshot`, the bundled demo, and the UI expose the same forecast state so verification uses one shared contract.
- [ ] **TRST-03**: The repo includes a repeatable validation flow for strong-signal, watch-signal, and insufficient-evidence forecast scenarios.

## Future Requirements

### Runtime Controls

- **CTRL-01**: Operator can start, stop, or restart local worker processes and services from the workstation.
- **CTRL-02**: Operator can see command outcomes, recovery state, and safe rollback guidance for runtime-control actions.

### Deeper Coordination Expansion

- **SURF-04**: Operator can open a deeper coordination analytics surface only if the existing `Agents` and `Mission Control` views can no longer carry the forecasting load.
- **CHAN-01**: Operator can inspect channel delivery state for Discord, Telegram, and Feishu alongside Mission Control context.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Automatic assignment or autonomous staffing | Forecasting must stay advisory and operator-controlled |
| Moving task ownership truth out of Mission Control | Mission Control remains the ownership system of record |
| Dedicated net-new coordination workspace | `v1.6.0` should extend existing `Agents` and `Mission Control` flows first |
| Host/runtime controls in the same milestone | Recovery and safety contract deserve separate scope |
| External hosted backend or shared multi-user session model | Local-first remains the default operator model |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FORE-01 | Phase 14 | Pending |
| FORE-02 | Phase 14 | Pending |
| FORE-03 | Phase 14 | Pending |
| SURF-01 | Phase 15 | Pending |
| SURF-02 | Phase 15 | Pending |
| SURF-03 | Phase 15 | Pending |
| TRST-01 | Phase 16 | Pending |
| TRST-02 | Phase 16 | Pending |
| TRST-03 | Phase 16 | Pending |

**Coverage:**
- v1.6.0 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0

---
*Requirements defined: 2026-03-21*
*Last updated: 2026-03-21 after starting v1.6.0 Evidence-Based Forecasting*
