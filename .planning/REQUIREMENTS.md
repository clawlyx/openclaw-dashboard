# Requirements: OpenClaw Dashboard v1.4.0

**Status:** Drafted 2026-03-15
**Milestone:** `v1.4.0 Agent Clarity`
**Milestone Goal:** Make the Agents view much easier to scan so the operator can see who is working, blocked, or idle at a glance and understand what idle agents could pick up next.

## This Milestone

### Agent Roster Clarity

- [ ] **AGENT-01**: Operator can see every agent’s name, status, current task, duration, and room/team in the default Agents view
- [ ] **AGENT-02**: Operator can understand who is working, blocked, or idle within a few seconds of opening the Agents view
- [ ] **AGENT-03**: Agents view prioritizes roster legibility over secondary intelligence/detail clutter

### Status-Based Triage

- [ ] **TRIAGE-01**: Agents are grouped into separate **Working**, **Blocked**, and **Idle** sections
- [ ] **TRIAGE-02**: Blocked agents appear in a clearly distinct section that makes intervention needs obvious
- [ ] **TRIAGE-03**: Idle agents appear in a clearly distinct section that makes assignment opportunities obvious

### Idle Suggestions

- [ ] **IDLE-01**: Idle agents can show a lightweight suggested next task hint in the Agents view
- [ ] **IDLE-02**: Suggested tasks follow a clear ranking rule: same room first, then role-fit, then any ready unowned task
- [ ] **IDLE-03**: When no reasonable next task exists, the Agents view shows a clear “no obvious assignment” state instead of a fake suggestion

### Idle Assignment Queue

- [ ] **QUEUE-01**: Operator can see a compact queue of idle agents and their suggested next task candidates
- [ ] **QUEUE-02**: Idle-assignment queue stays compact and scannable instead of duplicating full Mission Control task management
- [ ] **QUEUE-03**: Idle-assignment queue is clearly suggestive, not an automatic assignment engine

### Blocked Agent Emphasis

- [ ] **BLOCK-01**: Blocked agents show enough reason/context in the Agents view for the operator to understand why they are blocked
- [ ] **BLOCK-02**: Blocked agents show blocked duration or similarly useful time context
- [ ] **BLOCK-03**: Blocked state emphasis helps the operator identify intervention needs without opening Mission Control first

### Responsive Layout

- [ ] **RESP-01**: Desktop Agents view uses a dense, operator-friendly layout optimized for fast comparison across many agents
- [ ] **RESP-02**: Smaller screens adapt into a more card-like or stacked presentation without losing core status clarity
- [ ] **RESP-03**: Responsive layout preserves the same mental model across screen sizes: Working, Blocked, Idle, then suggestions

## Future Requirements

- **MC-01**: Mission Control gives even clearer task ownership / task-to-agent mapping
- **COORD-01**: Agents view improves team coordination, overlap, and handoff visibility beyond simple roster clarity

## Out of Scope

- automatic assignment or autonomous staffing decisions
- moving task ownership clarity out of Mission Control into Agents
- forecasting / SLA prediction for this milestone
- broader runtime-control surface changes

## Traceability

| Requirement | Planned Phase | Notes |
|-------------|---------------|-------|
| AGENT-01 | Phase 8 | Default Agents surface shows the operator’s core scan fields |
| AGENT-02 | Phase 8 | Roster state is understandable within a few seconds |
| AGENT-03 | Phase 8 | Roster legibility wins over clutter |
| TRIAGE-01 | Phase 8 | Separate Working / Blocked / Idle sections |
| TRIAGE-02 | Phase 8 | Blocked section emphasizes intervention needs |
| TRIAGE-03 | Phase 8 | Idle section emphasizes assignment opportunities |
| IDLE-01 | Phase 8 | Idle agents show lightweight next-task hints |
| IDLE-02 | Phase 8 | Suggestion ranking is same room, then role-fit, then ready unowned work |
| IDLE-03 | Phase 8 | No fake suggestion when no credible next task exists |
| QUEUE-01 | Phase 8 | Compact idle-assignment queue exists |
| QUEUE-02 | Phase 8 | Queue stays compact and does not duplicate Mission Control |
| QUEUE-03 | Phase 8 | Queue is suggestive, not automatic |
| BLOCK-01 | Phase 8 | Blocked agents expose enough context inline |
| BLOCK-02 | Phase 8 | Blocked duration or equivalent time context is visible |
| BLOCK-03 | Phase 8 | Intervention needs are readable without opening Mission Control first |
| RESP-01 | Phase 8 | Desktop layout stays dense and comparison-friendly |
| RESP-02 | Phase 8 | Smaller screens become more card-like without losing clarity |
| RESP-03 | Phase 8 | Same Working / Blocked / Idle mental model survives across breakpoints |

---

_Active milestone requirements for `v1.4.0`_
