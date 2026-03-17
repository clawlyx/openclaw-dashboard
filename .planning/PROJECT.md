# OpenClaw Dashboard

## What This Is

OpenClaw Dashboard is the operator workstation for a local OpenClaw setup. It turns agent presence, Mission Control queue state, usage history, provider limits, and scheduler health into one app so the operator does not need to bounce between multiple internal tools. `1.4.0` shipped a clearer operator triage surface: roster-first agent status, archive-era Mission Control boundaries, and provenance-aware coordination now live in the same workstation.

## Current State

- **Shipped version:** `1.4.0` on 2026-03-16
- **Milestone status:** `v1.5.0 Coordination Clarity` is active and in planning
- **Codebase shape:** Next.js App Router + React + TypeScript workstation, about 16.2k LOC across `app`, `components`, `lib`, and `demo`
- **Validation baseline:** `pnpm check`, bundled-demo browser verification, `/api/snapshot` provenance checks, and archive-boundary API validation
- **Archives:** `.planning/milestones/v1.2.0-ROADMAP.md`, `.planning/milestones/v1.2.0-REQUIREMENTS.md`, `.planning/milestones/v1.3.0-ROADMAP.md`, `.planning/milestones/v1.3.0-REQUIREMENTS.md`, `.planning/milestones/v1.4.0-ROADMAP.md`, `.planning/milestones/v1.4.0-REQUIREMENTS.md`, and `.planning/milestones/v1.4.0-MILESTONE-AUDIT.md`

## Core Value

One workstation should let the operator see who owns work, what needs action next, and move the mission forward without switching apps.

## Current Milestone: v1.5.0 Coordination Clarity

**Goal:** Make coordination across Agents and Mission Control easier to trust and faster to act on by clarifying task-to-agent mapping, overlap and handoff state, and the operator's next move without introducing new control surfaces.

**Target features:**
- Sharper task-to-agent mapping between Agents and Mission Control that clarifies who is serving what and where the operator should inspect or intervene
- Better overlap, handoff, and intervention visibility on the existing Agents and Mission Control surfaces
- More obvious next-action cues so the operator can tell the most useful move without reconstructing coordination state manually

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

### Active

- [ ] Agents and Mission Control make task-to-agent mapping clearer without creating a second ownership system
- [ ] Existing coordination surfaces expose overlap, handoff risk, and intervention needs more explicitly
- [ ] The default operator scan path makes the next best action obvious from current state alone

### Out of Scope

- Automatic assignment, autonomous staffing, or fake certainty about what an agent should do next
- Predictive bottleneck forecasting or SLA-style forecasting — deferred by the `v1.5.0` brief
- Host service or worker-process controls — deferred by the `v1.5.0` brief
- Net-new coordination workspace expansion beyond current Agents and Mission Control surfaces — prioritize clarity on known surfaces first
- Moving task ownership truth out of Mission Control into Agents
- Multi-user collaboration or shared operator sessions — single-operator workstation for now

## Context

- Existing app: Next.js App Router + React + TypeScript workstation reading local files under `~/.openclaw`, mission archive state under `~/.openclaw/mission-control`, and bundled demo fallback under `demo/openclaw-home`
- `1.4.0` proved the Agents workspace can be the operator's fastest triage surface when it stays roster-first, provenance-aware, and explicitly advisory
- Mission Control now treats `task-center`, `agent-launchpad`, and `agent-workflow` as archived context only; surviving task-center-like data is intentional personal research
- Bundled demo data now includes deterministic repo-work, intake-thread, and multi-session workload cases safe for public docs and runbooks
- Public README assets are demo-data driven and must remain safe to publish
- `v1.5.0` deliberately skips research and should deepen clarity on existing Agents and Mission Control surfaces before any net-new workspace expansion
- Forecasting and host controls were considered and explicitly deferred so the milestone stays focused on today's coordination blind spots
- The milestone must preserve the archive boundary and public-safe demo validation path established in `1.4.0`

## Constraints

- **Tech stack**: Continue in Next.js App Router, React, and TypeScript — preserve established patterns and current runtime assumptions
- **Data model**: Ownership truth stays in Mission Control even when Agents surfaces more guidance or provenance context
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
| The Agents view should be roster-first rather than another dense intelligence panel | Operators need immediate scan speed before deeper analysis | ✓ Good |
| Working / Blocked / Idle should be separate first-class sections | Triage clarity matters more than one long mixed list | ✓ Good |
| Idle suggestions should remain lightweight and explicitly non-automatic | Guidance is useful, fake certainty is harmful | ✓ Good |
| Task ownership truth stays in Mission Control | Agents should reference ownership, not redefine it | ✓ Good |
| Retire `task-center`, `agent-launchpad`, and `agent-workflow` as live repo-task ownership systems | Later coordination work needed one cleaned archive-era contract instead of another bridge | ✓ Good |
| Advisory repo and research sourcing must stay visibly non-owning | Suggestions are useful only if they do not masquerade as staffing truth | ✓ Good |
| Provenance confidence should be shown directly when metadata is partial | Operators need trustworthy context, not fake exactness | ✓ Good |

<details>
<summary>Archived milestone framing (before v1.4.0 completion)</summary>

- `1.4.0` started after `1.3.0` proved the workstation could explain pressure and room health but still needed faster staffing triage.
- The milestone focus was: rebuild Agents around Working / Blocked / Idle clarity, retire the legacy repo-task bridge, then add explicit provenance and a concise coordination brief.
- The archived roadmap, requirements, and audit for that shipped milestone live under `.planning/milestones/`.

</details>

---
*Last updated: 2026-03-16 after starting the v1.5.0 Coordination Clarity milestone*
