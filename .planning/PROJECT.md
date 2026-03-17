# OpenClaw Dashboard

## What This Is

OpenClaw Dashboard is the operator workstation for a local OpenClaw setup. It turns agent presence, Mission Control queue state, usage history, provider limits, and scheduler health into one app so the operator does not need to bounce between multiple internal tools. `1.4.0` shipped a clearer operator triage surface: roster-first agent status, archive-era Mission Control boundaries, and provenance-aware coordination now live in the same workstation.

## Current State

- **Shipped version:** `1.4.0` on 2026-03-16
- **Milestone status:** archived locally and ready for the next milestone definition
- **Codebase shape:** Next.js App Router + React + TypeScript workstation, about 16.2k LOC across `app`, `components`, `lib`, and `demo`
- **Validation baseline:** `pnpm check`, bundled-demo browser verification, `/api/snapshot` provenance checks, and archive-boundary API validation
- **Archives:** `.planning/milestones/v1.2.0-ROADMAP.md`, `.planning/milestones/v1.2.0-REQUIREMENTS.md`, `.planning/milestones/v1.3.0-ROADMAP.md`, `.planning/milestones/v1.3.0-REQUIREMENTS.md`, `.planning/milestones/v1.4.0-ROADMAP.md`, `.planning/milestones/v1.4.0-REQUIREMENTS.md`, and `.planning/milestones/v1.4.0-MILESTONE-AUDIT.md`

## Core Value

One workstation should let the operator see who owns work, what needs action next, and move the mission forward without switching apps.

## Current Milestone

No active milestone is defined. `1.4.0 Agent Clarity` shipped on 2026-03-16 and is archived under `.planning/milestones/`.

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

- [ ] Mission Control gives even clearer task ownership / task-to-agent mapping beyond the agent-focused provenance added in `1.4.0`
- [ ] Agents view improves overlap, handoff, and intervention clarity beyond the concise default coordination layer shipped in `1.4.0`
- [ ] Workstation predicts likely next bottlenecks from lifecycle and coordination signals before pressure escalates
- [ ] Operator can control host services and worker processes from the workstation

### Out of Scope

- Automatic assignment, autonomous staffing, or fake certainty about what an agent should do next
- Moving task ownership truth out of Mission Control into Agents
- Broad runtime-control expansion before the next milestone is explicitly scoped
- Multi-user collaboration or shared operator sessions — single-operator workstation for now

## Context

- Existing app: Next.js App Router + React + TypeScript workstation reading local files under `~/.openclaw`, mission archive state under `~/.openclaw/mission-control`, and bundled demo fallback under `demo/openclaw-home`
- `1.4.0` proved the Agents workspace can be the operator's fastest triage surface when it stays roster-first, provenance-aware, and explicitly advisory
- Mission Control now treats `task-center`, `agent-launchpad`, and `agent-workflow` as archived context only; surviving task-center-like data is intentional personal research
- Bundled demo data now includes deterministic repo-work, intake-thread, and multi-session workload cases safe for public docs and runbooks
- Public README assets are demo-data driven and must remain safe to publish

## Next Milestone Goals

- Deepen task-to-agent clarity between Agents and Mission Control without reintroducing dual ownership semantics
- Improve overlap, handoff, and coordination visibility beyond the concise default brief
- Decide whether the next milestone should prioritize coordination depth, forecasting, or runtime leverage before adding new phases
- Preserve the archive boundary and public-safe demo validation path established in `1.4.0`

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
*Last updated: 2026-03-16 after shipping v1.4.0 milestone*
