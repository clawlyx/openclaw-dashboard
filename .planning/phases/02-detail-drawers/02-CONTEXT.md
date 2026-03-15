# Phase 2: Detail Drawers - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a focused detail surface inside the existing Agents virtual office so the operator can inspect the exact room or agent that owns a mission without leaving the office view. This phase is about drawer state, navigation, and read-only detail presentation. Task mutations, review transitions, and pressure scoring belong to later phases.

</domain>

<decisions>
## Implementation Decisions

### Interaction model
- The detail surface lives inside `Agents -> Virtual office`, not as a separate route or full-page takeover.
- Room cards, desk cards, mission queue cards, and room sprites should route into one shared focused detail surface instead of each inventing a separate inspector.
- Existing room focus remains useful; the new drawer should build on the current focus model rather than replacing it with a second selection system.

### Drawer scope
- A room-focused drawer must answer who owns the room's current mission, what task is active now, what completed most recently, what happens next, and whether the work is blocked or waiting.
- An agent-focused drawer must stay pinned to the selected agent even when the room has multiple desks.
- Drawer content is read-only in Phase 2; inline actions stay deferred to Phase 3.

### Data sources
- Mission Control remains the source of truth for active task state, blocker text, waiting reasons, next planned step, and artifact references.
- Agent snapshots remain the source of truth for desk presence, recent activity, focus text, and latest task references.
- Explicit ownership should be used whenever available; inferred fallback stays visibly labeled and should still produce a usable drawer.

### Presentation constraints
- The office scene should remain the primary visual anchor. The drawer augments it; it should not collapse the current room grid into a generic list layout.
- Desktop can present the drawer alongside the existing office rails, but mobile should stack it naturally without trapping the rest of the office behind an overlay.
- Missing data should degrade to clear placeholders instead of hiding whole sections silently.

### Deferred work
- No task mutation controls in this phase.
- No new urgency scoring, stale timers, or overload heuristics in this phase.
- No attempt to invent per-agent ownership beyond the explicit task and room references already available.

### Claude's Discretion
- Exact drawer layout and motion treatment, as long as the office remains readable on desktop and mobile
- Exact grouping of metadata chips, timestamps, and artifact links

</decisions>

<specifics>
## Specific Ideas

- Reuse the selected-room filter and extend it with a shared selection model such as `room`, `agent`, or `mission` focus instead of adding disconnected booleans.
- Derive room drawer content from the already-computed room mission coverage plus a richer task join, not from a second pass over unrelated data.
- Build a task-to-feature lookup so a selected task can surface artifact links, branch name, and PR URL when the linked feature exposes them.
- Show the last completed task from the selected mission chain when available, even if the active task is still in `ready`, `running`, `review`, or `blocked`.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/agents-virtual-office-panel.tsx`: already owns room focus, mission queue routing, desk feeds, and the join between Agents and Mission Control.
- `lib/mission-control.ts`: already normalizes task-level blocker, waiting, next-step, delivery, and artifact metadata needed for drawer content.
- `lib/agents.ts`: already normalizes per-agent task references and recent activity metadata used for agent drawers.
- `app/globals.css`: already contains the office layout, rail, and card styles that the drawer should extend instead of replacing.

### Established Patterns
- The office view already uses one top-level React component with memoized joins for mission tasks, room coverage, and selected-room filtering.
- Mission queue cards currently focus the owning room; desk cards are presentational only and are the natural next entry point for agent-specific selection.
- Locale strings for the office are kept together in `locales/en.json` and `locales/zh.json`, so the drawer copy should stay in the same namespace.

### Integration Points
- `components/agents-virtual-office-panel.tsx`
- `app/globals.css`
- `locales/en.json`
- `locales/zh.json`
- `lib/mission-control.ts` only if a small selector/helper addition is needed for artifact-friendly joins

</code_context>

<deferred>
## Deferred Ideas

- Inline `advance`, `ready`, `block`, and `request review` controls — Phase 3
- Pressure signals such as stale review and room overload — Phase 4
- Host runtime controls, service actions, or non-mission workstation controls — outside this milestone

</deferred>

---
*Phase: 02-detail-drawers*
*Context gathered: 2026-03-14*
