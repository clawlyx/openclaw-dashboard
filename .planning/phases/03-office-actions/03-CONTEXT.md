# Phase 3: Office Actions - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Let the operator trigger supported Mission Control task transitions directly from the Agents office surface without creating a second workflow model. This phase is about action affordances, shared action-state rules, and post-mutation refresh behavior. Pressure scoring, urgency heuristics, and milestone packaging remain outside this phase.

</domain>

<decisions>
## Implementation Decisions

### Mutation source of truth
- The office surface must reuse the same action rules and API route that Mission Control already uses.
- No office-specific mutation endpoint should be introduced; `/api/mission-control/tasks/[taskId]` remains the task action boundary.
- Remote mode keeps the current restrictions: local-only transitions such as `start` and `send-to-review` stay unavailable when the repo is pointed at a live Launchpad API.

### Action visibility
- Supported actions should be clickable from the office surface for the focused task.
- Unsupported actions should remain visible but disabled instead of disappearing, so the operator understands which transitions exist but are unavailable in the current mode or status.
- The drawer is the primary action surface because it already holds the focused task context; queue-level actions can be lighter-weight but should not fork the action semantics.

### Refresh behavior
- After a mutation, the office view must refresh from Mission Control truth instead of mutating local optimistic copies into a second state model.
- Existing focus should be preserved when possible after refresh, and degrade cleanly if the selected task or owner context no longer exists in the refreshed snapshot.
- Error and pending states should stay visible inside the office surface so failures are understandable without switching panels.

### UI scope
- Phase 3 extends the existing owner-detail drawer and mission queue rather than redesigning the office layout again.
- Action copy should stay aligned with the Mission Control workspace wording instead of inventing separate office-only verbs.
- Disabled states need a clear visual treatment; hiding actions or making them indistinguishable from enabled buttons is not acceptable.

### Deferred work
- No urgency scoring or stale-review heuristics in this phase.
- No host/runtime controls or non-mission operator actions in this phase.
- No new persistence layer or workflow engine; Launchpad remains the delivery source of truth.

### Claude's Discretion
- Exact placement of the action group between the drawer and queue surfaces
- Exact disabled-state styling and helper text, as long as supported versus unsupported transitions stay obvious

</decisions>

<specifics>
## Specific Ideas

- Extend the existing action helper so it can describe both enabled and disabled actions rather than only returning the currently allowed subset.
- Reuse `MissionTaskActions` or extract a shared action-strip component instead of duplicating fetch, pending, and error handling inside the office panel.
- Use the drawer's `activeDetailTask` as the main office action anchor, with queue-card actions only where the same task context is already present.
- Verify both a rich explicit-owner task and a no-artifact/no-live-task fallback so action rendering does not assume every focus has a mutable task.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/agents-virtual-office-panel.tsx`: already computes the focused task and owner context the office actions should operate on.
- `components/mission-task-actions.tsx`: already encapsulates fetch, pending, error, and `router.refresh()` behavior for task mutations.
- `lib/mission-control-actions.ts`: already defines the allowed local and remote task actions.
- `app/api/mission-control/tasks/[taskId]/route.ts`: already validates transitions and maps remote actions through Launchpad workflow APIs.

### Established Patterns
- Mission Control task mutations always round-trip through the server and then `router.refresh()` instead of mutating local client state directly.
- Remote mode currently hides unsupported actions by omission, which Phase 3 needs to evolve into explicit disabled-state rendering.
- The office drawer already has the focused task, task path, and artifact context that action placement should build on.

### Integration Points
- `components/agents-virtual-office-panel.tsx`
- `components/mission-task-actions.tsx`
- `components/mission-control-panel.tsx`
- `lib/mission-control-actions.ts`
- `app/api/mission-control/tasks/[taskId]/route.ts`
- `locales/en.json`
- `locales/zh.json`

</code_context>

<deferred>
## Deferred Ideas

- Pressure signals, stale timers, and attention ordering improvements — Phase 4
- Cross-surface runtime controls and workstation management features — outside this milestone
- Alternate workflow semantics beyond the existing Launchpad transitions — out of scope

</deferred>

---
*Phase: 03-office-actions*
*Context gathered: 2026-03-14*
