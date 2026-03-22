# OpenClaw Dashboard

## What This Is

OpenClaw Dashboard is the operator workstation for a local OpenClaw setup. It turns agent presence, Mission Control queue state, usage history, provider limits, and scheduler health into one app so the operator does not need to bounce between multiple internal tools. `1.5.0` shipped clearer Mission Control mapping, overlap and handoff visibility, and one trustworthy next move across the existing `Agents` and `Mission Control` surfaces. `1.6.0` now focuses on evidence-based forecasting so operators can see what is likely to slip next before today's coordination issues become tomorrow's pressure spikes.

## Current State

- **Shipped version:** `1.5.0` on 2026-03-21
- **Milestone status:** `v1.6.0 Evidence-Based Forecasting` is defined; next step is planning Phase 14
- **Codebase shape:** Next.js App Router + React + TypeScript workstation, about 14.3k LOC across `app`, `components`, `lib`, and `demo`
- **Validation baseline:** `pnpm check`, bundled-demo browser verification, `/api/snapshot` coordination contract checks, and Mission Control continuity verification
- **Archives:** `.planning/milestones/v1.2.0-ROADMAP.md`, `.planning/milestones/v1.2.0-REQUIREMENTS.md`, `.planning/milestones/v1.3.0-ROADMAP.md`, `.planning/milestones/v1.3.0-REQUIREMENTS.md`, `.planning/milestones/v1.4.0-ROADMAP.md`, `.planning/milestones/v1.4.0-REQUIREMENTS.md`, `.planning/milestones/v1.4.0-MILESTONE-AUDIT.md`, `.planning/milestones/v1.5.0-ROADMAP.md`, `.planning/milestones/v1.5.0-REQUIREMENTS.md`, and `.planning/milestones/v1.5.0-MILESTONE-AUDIT.md`

## Core Value

One workstation should let the operator see who owns work, what needs action next, and move the mission forward without switching apps.

## Current Milestone: v1.6.0 Evidence-Based Forecasting

**Goal:** Turn coordination clarity into inspectable early-warning guidance across the existing `Agents` and `Mission Control` surfaces without manufacturing certainty.

**Target features:**
- Early-warning forecasting for overlap, handoff, queue, room, and mission slippage using the existing local snapshot and recent history.
- Explainable forecast evidence and confidence-aware fallback states so operators can tell why a forecast exists and when it is too weak to trust.
- Forecast continuity inside the existing `Agents`, `Mission Control`, `/api/snapshot`, and bundled-demo validation flows without adding a new workspace.

## Requirements

### Validated

- ✓ Single workstation shell with dedicated Agents, Mission Control, Overview, History, Usage, and Scheduler workspaces — shipped in `1.0.0`
- ✓ Agents virtual office joins live Mission Control state at the room level, including inline mission queue and focus-to-owner flow — shipped in `1.1.0`
- ✓ Explicit task ownership, room and agent drawers, office actions, and pressure signals are first-class in the office surface — shipped in `1.2.0`
- ✓ Historical aging, room intelligence, operator summaries, and lifecycle-aware pressure explanations are first-class in the workstation — shipped in `1.3.0`
- ✓ Agents surface is roster-first, immediately scannable, and grouped by Working / Blocked / Idle state — shipped in `1.4.0`
- ✓ Working agents show repo or intake provenance, and idle suggestions stay advisory with clear source reasoning — shipped in `1.4.0`
- ✓ Mission Control follows an archive-era local contract and no longer presents retired repo-task systems as live ownership truth — shipped in `1.4.0`
- ✓ Local-first snapshot loading from `~/.openclaw`, mission archive state, and bundled demo data keeps the app publishable without a custom backend — existing behavior
- ✓ Agents and Mission Control now show exact, partial, and unavailable task-to-agent mapping states without implying ownership moved out of Mission Control — shipped in `1.5.0`
- ✓ Existing coordination surfaces now expose overlap, handoff risk, and intervention priority explicitly across the default scan path and Mission Control landing states — shipped in `1.5.0`
- ✓ The default Agents scan path now highlights one recommended next move with explicit destination clarity, concise reasoning, and a calm fallback state — shipped in `1.5.0`

### Active

- [ ] Forecast emerging coordination bottlenecks with evidence the operator can inspect before pressure escalates.
- [ ] Surface forecasted risk from the existing `Agents` and `Mission Control` scan paths without creating a new coordination workspace.
- [ ] Keep forecasting advisory, confidence-aware, and consistent across the shared snapshot contract, bundled demo scenarios, and verification flow.

### Out of Scope

- Automatic assignment, autonomous staffing, or fake certainty about what an agent should do next
- Moving task ownership truth out of Mission Control into Agents
- Multi-user collaboration or shared operator sessions — single-operator workstation for now
- External hosted backend requirements — local-first remains the default operator model

## Context

- Existing app: Next.js App Router + React + TypeScript workstation reading local files under `~/.openclaw`, mission archive state under `~/.openclaw/mission-control`, and bundled demo fallback under `demo/openclaw-home`
- `1.4.0` proved the Agents workspace can be the operator's fastest triage surface when it stays roster-first, provenance-aware, and explicitly advisory
- `1.5.0` proved mapping clarity, overlap and handoff visibility, and recommendation guidance can stay inside the existing `Agents` and `Mission Control` flows without adding a new workspace
- Bundled demo data now supports deterministic exact / partial / unavailable mapping plus intervene / watch / calm recommendation cases safe for docs and runbooks
- Mission Control now treats `task-center`, `agent-launchpad`, and `agent-workflow` as archived context only; surviving task-center-like data is intentional personal research
- Bundled demo data now includes deterministic repo-work, intake-thread, and multi-session workload cases safe for public docs and runbooks
- Public README assets are demo-data driven and must remain safe to publish
- `1.6.0` intentionally tackles forecasting before runtime controls so the workstation can prove demand for forward-looking signal without taking on command-and-recovery complexity yet
- The workstation must preserve the archive boundary and public-safe demo validation path established in `1.4.0`

## Constraints

- **Tech stack**: Continue in Next.js App Router, React, and TypeScript — preserve established patterns and current runtime assumptions
- **Data model**: Ownership truth stays in Mission Control even when Agents surfaces more guidance or provenance context
- **Privacy**: README/demo assets must continue to use synthetic bundled data — public repo safety is mandatory
- **Product scope**: Operators should stay inside one workstation app — do not reintroduce multi-app workflow sprawl
- **Guidance model**: Recommendations must stay advisory, explainable, and grounded in current evidence rather than opaque scoring

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
| The Agents view should be roster-first rather than another dense intelligence panel | Operators need immediate scan speed before deeper analysis | ✓ Good |
| Working / Blocked / Idle should be separate first-class sections | Triage clarity matters more than one long mixed list | ✓ Good |
| Idle suggestions should remain lightweight and explicitly non-automatic | Guidance is useful, fake certainty is harmful | ✓ Good |
| Task ownership truth stays in Mission Control | Agents should reference ownership, not redefine it | ✓ Good |
| Retire `task-center`, `agent-launchpad`, and `agent-workflow` as live repo-task ownership systems | Later coordination work needed one cleaned archive-era contract instead of another bridge | ✓ Good |
| Advisory repo and research sourcing must stay visibly non-owning | Suggestions are useful only if they do not masquerade as staffing truth | ✓ Good |
| Provenance confidence should be shown directly when metadata is partial | Operators need trustworthy context, not fake exactness | ✓ Good |
| Show exact, partial, and unavailable Mission Control mapping states explicitly | Operators need to judge handoff confidence without guessing or assuming ownership changed | ✓ Good |
| Keep overlap, handoff, and recommendation context inside existing `Agents` and `Mission Control` surfaces | Coordination clarity should improve scan speed without creating another workspace | ✓ Good |
| Rank one default next move on the server and keep a calm fallback explicit | Every surface should consume the same advisory signal and avoid manufacturing urgency | ✓ Good |
| Forecasts must explain their evidence and confidence before asking the operator to act | Forward-looking guidance is only useful if operators can inspect why it exists and when it is too weak to trust | ✓ New |

<details>
<summary>Archived milestone framing (before v1.5.0 completion)</summary>

- `1.5.0` started after `1.4.0` proved the Agents workspace could be the fastest triage surface but still left mapping quality, overlap, and next-action clarity implicit.
- The milestone focus was: make Mission Control mapping state explicit, surface overlap and handoff risk across the existing `Agents` and `Mission Control` flows, and end with one trustworthy default next move.
- The archived roadmap, requirements, and audit for that shipped milestone live under `.planning/milestones/`.

</details>

---
*Last updated: 2026-03-21 after starting v1.6.0 Evidence-Based Forecasting*
