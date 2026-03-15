# OpenClaw Dashboard

## What This Is

OpenClaw Dashboard is the operator workstation for a local OpenClaw setup. It turns agent presence, Mission Control queue state, usage history, provider limits, and scheduler health into one app so the operator does not need to bounce between multiple internal tools. `1.3.0` shipped the operator-intelligence workstation: ownership, actions, pressure, room intelligence, and lifecycle-aware trends now all live in the same product surface.

## Current State

- **Shipped version:** `1.3.0` on 2026-03-15
- **Milestone status:** archived, tagged, and ready for the next milestone definition
- **Codebase shape:** Next.js App Router + React + TypeScript workstation, about 12.1k LOC across `app`, `components`, `lib`, and `demo`
- **Validation baseline:** `pnpm check`, bundled-demo browser verification, lifecycle API checks, and refreshed public assets
- **Archives:** `.planning/milestones/v1.2.0-ROADMAP.md`, `.planning/milestones/v1.2.0-REQUIREMENTS.md`, `.planning/milestones/v1.3.0-ROADMAP.md`, and `.planning/milestones/v1.3.0-REQUIREMENTS.md`

## Core Value

One workstation should let the operator see who owns work, what needs action next, and move the mission forward without switching apps.

## Current Milestone

No active milestone is defined. `1.3.0 Operator Intelligence` shipped on 2026-03-15 and is archived under `.planning/milestones/`.

## Requirements

### Validated

- ✓ Single workstation shell with dedicated Agents, Mission Control, Overview, History, Usage, and Scheduler workspaces — shipped in `1.0.0`
- ✓ Agents virtual office joins live Mission Control state at the room level, including inline mission queue and focus-to-owner flow — shipped in `1.1.0`
- ✓ Explicit task ownership, room and agent drawers, office actions, and pressure signals are first-class in the office surface — shipped in `1.2.0`
- ✓ Historical aging, room intelligence, operator summaries, and lifecycle-aware pressure explanations are first-class in the workstation — shipped in `1.3.0`
- ✓ Local-first snapshot loading from `~/.openclaw`, `~/.agent-launchpad`, and bundled demo data keeps the app publishable without a custom backend — existing behavior

### Active

- [ ] Workstation predicts likely next bottlenecks from recent lifecycle and room trends
- [ ] Workstation highlights likely SLA breaches before they happen
- [ ] Operator can control host services and worker processes from the workstation
- [ ] Operator can approve or retry broader runtime operations without leaving the app

### Out of Scope

- Replacing Agent Launchpad as the source of truth — keep delivery state in Launchpad, not duplicated here
- Building a second persistence model inside `openclaw-dashboard` — the workstation should read and act on existing state, not fork it
- Full host-runtime control or process orchestration — beyond current mission ownership scope
- Multi-user collaboration or shared operator sessions — single-operator workstation for now

## Context

- Existing app: Next.js App Router + React + TypeScript workstation reading local files under `~/.openclaw` and `~/.agent-launchpad`, with demo fallback under `demo/openclaw-home`
- `1.3.0` proved the office can be the operator’s primary intelligence surface for seeing aging, bottlenecks, room health, and lifecycle direction
- Bundled public previews now require both `OPENCLAW_HOME=demo/openclaw-home` and an empty or missing `AGENT_LAUNCHPAD_HOME` to keep Mission Control on safe demo data
- Public README assets are demo-data driven and must remain safe to publish

## Next Milestone Goals

- Build the next milestone around forecasting and runtime leverage rather than more current-state visibility
- Preserve the explainable, snapshot-derived model established in `1.3.0` while extending it into prediction and control
- Keep public-safe demo validation and screenshot provenance as a release gate for future milestones

## Constraints

- **Tech stack**: Continue in Next.js App Router, React, and TypeScript — preserve established patterns and current runtime assumptions
- **Data model**: Mission Control remains the task source of truth and agents snapshot remains local runtime state — avoid dual-write drift
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

<details>
<summary>Archived milestone framing (before v1.3.0 completion)</summary>

- `1.3.0` started as the operator-intelligence milestone after `1.2.0` proved the workstation could own room-level actions and pressure triage.
- The milestone focus was: add historical signals, room intelligence, operator summaries, lifecycle-aware pressure, then package demo-safe assets and docs.
- The archived roadmap and requirements for that shipped milestone live under `.planning/milestones/`.

</details>

---
*Last updated: 2026-03-15 after shipping v1.3.0 milestone*
