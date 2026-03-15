# Phase 4: Pressure Signals - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Turn the office from a mutation surface into an operator-priority surface. This phase adds explainable pressure signals to the Agents workspace, then packages the explicit-ownership milestone as the `1.2.0` release candidate with refreshed demo assets and validation docs.

</domain>

<decisions>
## Implementation Decisions

### Pressure model
- Pressure cues must be derived from existing mission and agent state, not from opaque heuristics or a hidden scoring service.
- Required signals for this phase are:
  - stale review
  - blocked too long
  - waiting on human
  - no explicit owner / inferred-only ownership
  - overloaded room
- Signals must stay readable as operator language, not just numeric severity.

### Source of truth
- Pressure signals should derive from the same office and Mission Control snapshot data already used by the workstation.
- Do not add a second persistence layer or background scoring system.
- Time-based signals should use a stable snapshot timestamp passed from the server layer so hydration stays deterministic.

### UI scope
- The existing attention rail should evolve into a mission-aware pressure rail instead of staying a desk-only blocked list.
- Room cards and mission queue cards can show light signal badges if they help answer "where should I look next?" without cluttering the office.
- Attention ordering should prioritize severity first, then age, then workload.

### Milestone packaging
- Phase 4 is the packaging phase for `1.2.0`.
- Demo data and screenshots must remain safe to publish.
- The release candidate should include README refresh, changelog/version bump, screenshots, and a repeatable acceptance runbook.

### Deferred work
- No hidden machine-learned prioritization.
- No host-runtime control panel.
- No multi-user collaboration surface.

### Claude's Discretion
- Exact threshold values for stale review, blocked-too-long, waiting-on-human, and overload, as long as they are explainable and visible in copy.
- Exact mix of badges, cards, and summary chips used to surface pressure without overloading the office.

</decisions>

<specifics>
## Specific Ideas

- Add a dedicated pressure-signal helper that scores and sorts mission-driven alerts from snapshot data.
- Use the snapshot `generatedAt` timestamp from `app/page.tsx` as the stable "now" anchor for age-based pressure calculations.
- Upgrade the attention rail from agent cards to signal cards that can point at a room, agent, or mission.
- Add room-level signal counts or badges so overloaded or risky rooms stand out before the operator opens the drawer.
- Refresh bundled sample mission-control data so at least one screenshot-safe example shows stale review, waiting-on-human, blocked-too-long, and inferred ownership pressure.
- Package the release as `1.2.0` with updated public screenshots and a release-candidate runbook.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/agents-virtual-office-panel.tsx` already has mission queue, room cards, and an attention rail that can be upgraded into a pressure surface.
- `lib/mission-control.ts` already carries the task fields needed for age, blocked reason, waiting-on, and ownership.
- `app/page.tsx` already owns the stable snapshot payload and can pass a generated timestamp into the office surface.
- `.github/assets/` and current README files already support a public-safe screenshot workflow.

### Established Patterns
- Demo/public verification uses `OPENCLAW_HOME=demo/openclaw-home`.
- Mission Control remains the delivery source of truth.
- The office surface already uses explicit vs inferred ownership labeling, which can become a pressure input instead of only a presentation detail.

### Integration Points
- `app/page.tsx`
- `components/agents-virtual-office-panel.tsx`
- `app/globals.css`
- `locales/en.json`
- `locales/zh.json`
- `lib/mission-control.ts`
- `demo/openclaw-home/agents/dashboard.json`
- `README.md`
- `README.zh-CN.md`
- `CHANGELOG.md`
- `package.json`

</code_context>

<deferred>
## Deferred Ideas

- SLA charts and historical pressure trend analytics
- Cross-surface workstation controls outside mission operations
- Multi-operator sync or shared queue ownership

</deferred>

---
*Phase: 04-pressure-signals*
*Context gathered: 2026-03-14*
