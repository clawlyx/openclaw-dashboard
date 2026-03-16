# Phase 8: Agent Clarity - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the Agents view much easier to scan at a glance. The operator should be able to open the workstation and immediately see who is working, who is blocked, who is idle, what each agent is doing, and what idle agents could reasonably pick up next. This phase is about roster clarity, triage clarity, and responsive presentation. It is not about automatic staffing, moving ownership truth out of Mission Control, or broader runtime-control work.

</domain>

<decisions>
## Implementation Decisions

### Operator priorities
- At-a-glance roster clarity comes first.
- Idle and blocked triage comes second.
- Broader team-coordination and overlap analysis can come later.
- Task ownership truth stays in Mission Control rather than being redefined inside Agents.

### Default agent information
- Every agent row/card should prioritize name, status, current task, duration, and room/team.
- The default presentation should make working, blocked, and idle states understandable within a few seconds.
- Secondary intelligence should not crowd out roster legibility.

### Sectioning and emphasis
- Agents should appear in distinct Working, Blocked, and Idle sections.
- Blocked agents should have stronger reason and time context so intervention needs are obvious.
- Idle agents should surface lightweight suggestion hints, not fake certainty or auto-assignment.

### Idle suggestions
- Suggestion ranking should be: same room first, then role-fit, then any ready unowned task.
- Suggestions should appear both as a lightweight card hint and in a compact idle-assignment queue.
- When no credible suggestion exists, the UI should say so explicitly.

### Responsive layout
- Desktop should stay dense and optimized for fast comparison across many agents.
- Smaller screens can become more card-like or stacked as long as the same Working / Blocked / Idle mental model survives.

### Claude's Discretion
- Exact visual treatment for section headers, blocked emphasis, and idle hints.
- Exact queue density and layout treatment as long as it stays suggestive rather than managerial.
- Exact room/team labeling and duration formatting, as long as the primary scan path stays fast.

</decisions>

<specifics>
## Specific Ideas

- Treat the Agents view as a roster-first triage surface rather than another analytics panel.
- Keep the default view focused on status clarity before deeper coordination metrics.
- Avoid copying Mission Control task-management UI into the idle queue.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/agents-virtual-office-panel.tsx` already joins room, mission, and agent presence state into one operator-facing surface.
- `lib/mission-control.ts` already exposes the ownership and task details that should remain the source of truth.
- `lib/openclaw.ts` already supplies the snapshot payloads that drive the current Agents view.

### Established Patterns
- The workstation already uses one-page operator sections with dense desktop layouts and responsive fallbacks.
- Ownership clarity belongs in Mission Control and should be referenced from Agents, not reimplemented there.
- Demo-safe data and screenshot provenance still matter for any visible UI changes.

### Integration Points
- `components/agents-virtual-office-panel.tsx`
- `app/page.tsx`
- `app/globals.css`
- `lib/openclaw.ts`
- `lib/mission-control.ts`
- `locales/en.json`
- `locales/zh.json`

</code_context>

<deferred>
## Deferred Ideas

- Broader team-coordination, handoff, and overlap analysis
- Automatic assignment or autonomous staffing decisions
- Forecasting or SLA prediction
- Broader runtime-control surface changes

</deferred>
