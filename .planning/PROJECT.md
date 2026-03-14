# OpenClaw Dashboard

## What This Is

OpenClaw Dashboard is the operator workstation for a local OpenClaw setup. It turns agent presence, Mission Control queue state, usage history, provider limits, and scheduler health into one app so the operator does not need to bounce between multiple internal tools.

## Core Value

One workstation should let the operator see who owns work, what needs action next, and move the mission forward without switching apps.

## Requirements

### Validated

- ✓ Single workstation shell with dedicated Agents, Mission Control, Overview, History, Usage, and Scheduler workspaces — shipped in `1.0.0`
- ✓ Agents virtual office joins live Mission Control state at the room level, including inline mission queue and focus-to-owner flow — shipped in `1.1.0`
- ✓ Local-first snapshot loading from `~/.openclaw`, `~/.agent-launchpad`, and bundled demo data keeps the app publishable without a custom backend — existing behavior

### Active

- [ ] Explicit task ownership is first-class in the snapshot contract and UI, not inferred from room or lane heuristics
- [ ] The office view exposes room and agent detail drawers with current task, previous task, next step, and blocker context
- [ ] Common task actions can be triggered from the office surface and refresh from Mission Control truth
- [ ] Pressure signals surface stale reviews, blocked work, no-owner tasks, waiting-on-human, and overloaded rooms

### Out of Scope

- Replacing Agent Launchpad as the source of truth — keep delivery state in Launchpad, not duplicated here
- Building a second persistence model inside `openclaw-dashboard` — the workstation should read and act on existing state, not fork it
- Full host-runtime control or process orchestration — beyond current mission ownership scope
- Multi-user collaboration or shared operator sessions — single-operator workstation for now

## Context

- Existing app: Next.js App Router + React + TypeScript workstation reading local files under `~/.openclaw` and `~/.agent-launchpad`, with demo fallback under `demo/openclaw-home`
- `1.1.0` proved the combined Agents and Mission Control surface is useful, but room ownership is still inferred from task lane/status and agent free-text fields
- The active product brief for this milestone already exists in `plans/openclaw-dashboard-1-2-0-explicit-ownership.md` with acceptance flow in `runbooks/openclaw-dashboard-1-2-0-explicit-ownership-e2e.md`
- Public README assets are demo-data driven and must remain safe to publish

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
| Explicit ownership is the `1.2.0` milestone | `1.1.0` room inference is useful but not trustworthy enough for agent-level operations | — Pending |
| Keep fallback inference visible when explicit ownership is missing | Existing live installs may not emit new ownership fields immediately | — Pending |

---
*Last updated: 2026-03-14 after GSD-2 initialization*
