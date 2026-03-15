# OpenClaw Dashboard

## What This Is

OpenClaw Dashboard is the operator workstation for a local OpenClaw setup. It turns agent presence, Mission Control queue state, usage history, provider limits, and scheduler health into one app so the operator does not need to bounce between multiple internal tools. `1.2.0` shipped the explicit-ownership workstation: task ownership, office drawers, office actions, and pressure signals now all live in the same product surface.

## Current State

- **Shipped version:** `1.2.0` on 2026-03-14
- **Milestone status:** archived and tagged, ready for the next milestone definition
- **Codebase shape:** Next.js App Router + React + TypeScript workstation, about 13.9k LOC across `app`, `components`, `lib`, and `demo`
- **Validation baseline:** `pnpm typecheck`, `pnpm lint`, `pnpm build`, bundled-demo browser verification, and refreshed public assets
- **Archives:** `.planning/milestones/v1.2.0-ROADMAP.md` and `.planning/milestones/v1.2.0-REQUIREMENTS.md`

## Core Value

One workstation should let the operator see who owns work, what needs action next, and move the mission forward without switching apps.

## Requirements

### Validated

- ✓ Single workstation shell with dedicated Agents, Mission Control, Overview, History, Usage, and Scheduler workspaces — shipped in `1.0.0`
- ✓ Agents virtual office joins live Mission Control state at the room level, including inline mission queue and focus-to-owner flow — shipped in `1.1.0`
- ✓ Explicit task ownership, room and agent drawers, office actions, and pressure signals are first-class in the office surface — shipped in `1.2.0`
- ✓ Local-first snapshot loading from `~/.openclaw`, `~/.agent-launchpad`, and bundled demo data keeps the app publishable without a custom backend — existing behavior

### Active

- No active milestone requirements. Start the next version with `$gsd-new-milestone`.

### Out of Scope

- Replacing Agent Launchpad as the source of truth — keep delivery state in Launchpad, not duplicated here
- Building a second persistence model inside `openclaw-dashboard` — the workstation should read and act on existing state, not fork it
- Full host-runtime control or process orchestration — beyond current mission ownership scope
- Multi-user collaboration or shared operator sessions — single-operator workstation for now

## Context

- Existing app: Next.js App Router + React + TypeScript workstation reading local files under `~/.openclaw` and `~/.agent-launchpad`, with demo fallback under `demo/openclaw-home`
- `1.2.0` proved the office can be the operator’s primary surface for seeing ownership, pressure, and supported task motion
- Bundled public previews now require both `OPENCLAW_HOME=demo/openclaw-home` and an empty or missing `AGENT_LAUNCHPAD_HOME` to keep Mission Control on safe demo data
- Public README assets are demo-data driven and must remain safe to publish

## Next Milestone Goals

- Define the next milestone with `$gsd-new-milestone`
- Decide whether the next version should prioritize operator intelligence metrics, host/runtime controls, or a broader control surface
- Keep milestone scope explicit and versioned rather than letting the workstation sprawl without a contract

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

<details>
<summary>Archived milestone framing (before v1.2.0 completion)</summary>

- `1.2.0` started as the explicit ownership milestone after `1.1.0` proved the joined workstation model.
- The milestone focus was: make ownership first-class, add owner drawers, reuse office-side actions, then package pressure signals and public-safe assets.
- The archived roadmap and requirements for that shipped milestone live under `.planning/milestones/`.

</details>

---
*Last updated: 2026-03-14 after v1.2.0 milestone*
