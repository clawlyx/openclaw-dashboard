# Roadmap: OpenClaw Dashboard

## Current Milestone

**Version:** `v1.5.0`
**Name:** `Coordination Clarity`
**Status:** In progress as of 2026-03-19
**Phases:** `11-13`
**Requirements:** `9`

## Overview

`v1.5.0 Coordination Clarity` deepens coordination trust on the existing `Agents` and `Mission Control` surfaces. The milestone sharpens mission-to-agent mapping, makes overlap and handoff risk easier to read, and ends with a more obvious default next action so operators can move work forward without reconstructing context manually.

## Phase Summary

| Phase | Name | Goal | Requirements | Success Criteria |
|-------|------|------|--------------|------------------|
| 11 | Mission-to-Agent Mapping Clarity | Operators can anchor working agents to the right Mission Control task context and move between surfaces without ownership confusion | MAP-01, MAP-02, MAP-03 | Complete 2026-03-17 |
| 12 | Overlap and Handoff Visibility | Distinguish healthy parallel work from coordination ambiguity and expose active handoff state | HAND-01, HAND-02, HAND-03 | Complete 2026-03-19 |
| 13 | Default Coordination Guidance | Make the next trustworthy operator action obvious from the default Agents scan path | NEXT-01, NEXT-02, NEXT-03 | 4 |

## Phases

### Phase 11: Mission-to-Agent Mapping Clarity

**Goal**: Operators can anchor working agents to the right Mission Control task context and move between surfaces without ownership confusion.
**Depends on**: Phase 10 shipped baseline from `v1.4.0`
**Requirements**: `MAP-01`, `MAP-02`, `MAP-03`

Success criteria:
1. A working agent with a live Mission Control mapping shows its current linked task directly in the Agents coordination surface.
2. The mapping state is clearly labeled as exact, partial, or unavailable, and the presentation makes clear that Mission Control still owns task truth.
3. The operator can open the relevant Mission Control context from Agents without manually searching for the task.

### Phase 12: Overlap and Handoff Visibility

**Goal**: Operators can distinguish healthy parallel work from coordination ambiguity and see where active handoffs stand.
**Depends on**: Phase 11
**Requirements**: `HAND-01`, `HAND-02`, `HAND-03`

Success criteria:
1. When multiple agents are serving the same mission or closely related work, the operator can tell whether it looks like intentional parallelism or risky overlap.
2. Active work shows recent handoff context, including the last involved agent and the expected next owner or lane when that data exists.
3. Overlap or handoff ambiguity that needs intervention is elevated above routine parallel work so the operator can prioritize it correctly.
4. The operator can inspect this overlap and handoff state on existing Agents and Mission Control surfaces without needing a new coordination workspace.

### Phase 13: Default Coordination Guidance

**Goal**: Operators can follow one trustworthy next move from the default Agents scan path without reconstructing coordination state manually.
**Depends on**: Phase 12
**Requirements**: `NEXT-01`, `NEXT-02`, `NEXT-03`

Success criteria:
1. The default Agents coordination surface presents one clear recommended next action for the highest-priority current coordination issue.
2. The recommendation tells the operator whether the next move belongs in Agents or Mission Control before they navigate away.
3. The recommendation includes concise reasoning tied to current mapping, overlap, or handoff state so it reads as trustworthy guidance rather than a guess.
4. The operator can understand the issue, the recommended move, and the destination from the default scan path itself without opening a separate coordination surface first.

## Delivery Notes

- Research was intentionally skipped for this milestone because the brief focused on clearer delivery across existing surfaces rather than new domain expansion.
- Mission Control remains the ownership system of record throughout this roadmap; Agents can reference and summarize ownership context but must not redefine it.
- Partial or unavailable mapping and handoff metadata must be treated as first-class states, not edge cases.
- Predictive forecasting, host controls, and any net-new coordination workspace remain explicitly deferred.

## Archived Milestones

- [v1.4.0 Agent Clarity](milestones/v1.4.0-ROADMAP.md) — shipped 2026-03-16, phases 8-10
- [v1.3.0 Operator Intelligence](milestones/v1.3.0-ROADMAP.md) — shipped 2026-03-15, phases 5-7
- [v1.2.0 Explicit Ownership Workstation](milestones/v1.2.0-ROADMAP.md) — shipped 2026-03-14, phases 1-4

## Next Step

Run `$gsd-plan-phase 13` to continue `v1.5.0 Coordination Clarity`.
