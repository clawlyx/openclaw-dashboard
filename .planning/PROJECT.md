# OpenClaw Dashboard

## What This Is

OpenClaw Dashboard is the operator workstation for a local OpenClaw setup. It turns agent presence, Mission Control queue state, usage history, provider limits, and scheduler health into one app so the operator does not need to bounce between multiple internal tools. `1.3.0` shipped the operator-intelligence workstation; the next milestone focuses on making the Agents view dramatically clearer and faster to scan during day-to-day triage.

## Current State

- **Shipped version:** `1.3.0` on 2026-03-15
- **Active milestone:** `v1.4.0 Agent Clarity`
- **Codebase shape:** Next.js App Router + React + TypeScript workstation, about 12.1k LOC across `app`, `components`, `lib`, and `demo`
- **Validation baseline:** `pnpm check`, bundled-demo browser verification, lifecycle API checks, and refreshed public assets
- **Archives:** `.planning/milestones/v1.2.0-ROADMAP.md`, `.planning/milestones/v1.2.0-REQUIREMENTS.md`, `.planning/milestones/v1.3.0-ROADMAP.md`, and `.planning/milestones/v1.3.0-REQUIREMENTS.md`

## Core Value

One workstation should let the operator see who owns work, what needs action next, and move the mission forward without switching apps.

## Current Milestone: v1.4.0 Agent Clarity

**Goal:** Make the Agents view dramatically easier to scan so the operator can tell who is working, blocked, or idle at a glance and see lightweight next-task hints for idle agents.

**Target features:**
- Roster-first Agents redesign with default name, status, current task, duration, and room/team visibility
- Explicit Working / Blocked / Idle sections with stronger blocked-agent emphasis
- Lightweight idle-agent suggestion hints plus a compact idle-assignment queue
- Responsive layout cleanup that preserves the same triage mental model across desktop and smaller screens

## Requirements

### Validated

- ✓ Single workstation shell with dedicated Agents, Mission Control, Overview, History, Usage, and Scheduler workspaces — shipped in `1.0.0`
- ✓ Agents virtual office joins live Mission Control state at the room level, including inline mission queue and focus-to-owner flow — shipped in `1.1.0`
- ✓ Explicit task ownership, room and agent drawers, office actions, and pressure signals are first-class in the office surface — shipped in `1.2.0`
- ✓ Historical aging, room intelligence, operator summaries, and lifecycle-aware pressure explanations are first-class in the workstation — shipped in `1.3.0`
- ✓ Local-first snapshot loading from `~/.openclaw`, `~/.agent-launchpad`, and bundled demo data keeps the app publishable without a custom backend — existing behavior

### Active

- [ ] Agents surface is roster-first and immediately scannable for working, blocked, and idle state
- [ ] Idle agents show credible lightweight next-task hints without implying automatic assignment
- [ ] Blocked agents expose enough inline reason and time context to make intervention needs obvious
- [ ] Responsive layout preserves the same triage mental model across desktop and smaller screens

### Out of Scope

- Automatic assignment, autonomous staffing, or fake certainty about what an agent should do next
- Multi-user collaboration or shared operator sessions — single-operator workstation for now
- Moving task ownership clarity out of Mission Control into Agents
- Forecasting, SLA prediction, or broader runtime-control surface changes for this milestone

## Context

- Existing app: Next.js App Router + React + TypeScript workstation reading local files under `~/.openclaw` and `~/.agent-launchpad`, with demo fallback under `demo/openclaw-home`
- `1.3.0` proved the office can be the operator’s primary intelligence surface for seeing aging, bottlenecks, room health, and lifecycle direction
- The current Agents view already joins presence, room, and mission context, but the scan path is not yet roster-first enough for fast triage
- Mission Control remains the source of truth for task ownership and should stay that way while Agents improves status clarity
- Public README assets are demo-data driven and must remain safe to publish

## Next Milestone Goals

- Rebuild the Agents surface around fast roster legibility and status-based triage
- Surface blocked-agent emphasis and idle-agent suggestion flow without duplicating Mission Control management UI
- Preserve a dense operator-friendly desktop layout while making smaller-screen behavior cleaner and more card-like
- Leave broader coordination analytics and ownership-model changes for later milestones

## Constraints

- **Tech stack**: Continue in Next.js App Router, React, and TypeScript — preserve established patterns and current runtime assumptions
- **Data model**: Ownership truth stays in Mission Control even when Agents surfaces more guidance
- **Privacy**: README/demo assets must continue to use synthetic bundled data — public repo safety is mandatory
- **Product scope**: Operators should stay inside one workstation app — do not reintroduce multi-app workflow sprawl

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| `openclaw-dashboard` is the primary operator app | Users do not want multiple apps open to run OpenClaw | ✓ Good |
| Mission Control task state stays separate from agent presence in the snapshot | Task truth and runtime presence evolve at different rates | ✓ Good |
| Explicit ownership is the `1.2.0` milestone | `1.1.0` room inference is useful but not trustworthy enough for agent-level operations | ✓ Good |
| Keep fallback inference visible when explicit ownership is missing | Existing live installs may not emit new ownership fields immediately | ✓ Good |
| Reuse Mission Control actions from the office surface | Operators should not jump between views for routine task transitions | ✓ Good |
| Pressure must stay explainable and snapshot-derived | The operator needs readable urgency cues, not opaque scoring | ✓ Good |
| Operator intelligence belongs in the office surface, not a separate analytics workspace | Triage, explanation, and action should stay in one operator workflow | ✓ Good |
| Public release assets must come only from bundled demo data | Screenshot provenance needs to remain auditable and safe for publication | ✓ Good |
| The Agents view should be roster-first rather than another dense intelligence panel | Operators need immediate scan speed before deeper analysis | Proposed for `v1.4.0` |
| Working / Blocked / Idle should be separate first-class sections | Triage clarity matters more than one long mixed list | Proposed for `v1.4.0` |
| Idle suggestions should remain lightweight and explicitly non-automatic | Guidance is useful, fake certainty is harmful | Proposed for `v1.4.0` |
| Task ownership truth stays in Mission Control | Agents should reference ownership, not redefine it | Proposed for `v1.4.0` |

<details>
<summary>Archived milestone framing</summary>

- `1.3.0` started as the operator-intelligence milestone after `1.2.0` proved the workstation could own room-level actions and pressure triage.
- The milestone focus was: add historical signals, room intelligence, operator summaries, lifecycle-aware pressure, then package demo-safe assets and docs.
- The archived roadmap and requirements for that shipped milestone live under `.planning/milestones/`.

</details>

---
*Last updated: 2026-03-15 after starting v1.4.0 Agent Clarity*
