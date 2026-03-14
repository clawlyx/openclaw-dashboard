# Phase 1: Ownership Contract - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Make explicit mission ownership and structured task references available to the dashboard without breaking the current fallback behavior. This phase is about the data contract and the minimum office-surface changes needed to distinguish explicit ownership from inferred ownership. Drawers, inline actions, and pressure scoring belong to later phases.

</domain>

<decisions>
## Implementation Decisions

### Snapshot sources
- Mission Control remains the source of truth for task ownership metadata.
- Agents snapshot gains structured task references but keeps the current free-text fields for backward compatibility.
- Ownership fields stay optional at the type level because live installs may lag behind the new contract.

### Fallback behavior
- When explicit owner fields are missing, preserve the current room and lane inference path.
- The UI must label inferred ownership as inferred instead of silently presenting it as ground truth.
- Explicit ownership always wins when both explicit and inferred values exist.

### Demo safety
- Demo data must include both explicit and inferred cases so the public preview exercises the new contract safely.
- Sample ownership values should remain synthetic and repo-safe.

### UI scope
- Phase 1 only changes the office surface enough to make explicit versus inferred ownership clear.
- Room and agent drawers, inline actions, and pressure scoring are deferred to later phases.

### Claude's Discretion
- Exact helper naming and presenter structure
- Exact visual treatment for inferred labels, as long as the distinction is unambiguous

</decisions>

<specifics>
## Specific Ideas

- Reuse the existing Agents and Mission Control join path instead of inventing a second ownership presenter tree.
- Keep `/api/snapshot` and the bundled demo dataset aligned so screenshot flows stay trustworthy.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/mission-control.ts`: normalizes Launchpad feature/task state and already owns the demo mission sample
- `lib/agents.ts`: normalizes `agents/dashboard.json` and fallback runtime inference for agent presence
- `lib/openclaw.ts`: composes the top-level dashboard snapshot used by the page and API route
- `components/agents-virtual-office-panel.tsx`: already computes room mission coverage and is the place where inferred ownership becomes visible

### Established Patterns
- Snapshot loaders normalize optional values through helpers like `asString`, `asNumber`, and explicit union normalizers
- Demo fallback state is embedded in snapshot readers rather than requiring extra services
- The app prefers local-first file reads with safe demo fallbacks over new backend dependencies

### Integration Points
- `lib/mission-control.ts`
- `lib/agents.ts`
- `lib/openclaw.ts`
- `components/agents-virtual-office-panel.tsx`
- `app/api/snapshot/route.ts`

</code_context>

<deferred>
## Deferred Ideas

- Room and agent detail drawers — Phase 2
- Office mutation controls — Phase 3
- Pressure scoring and demo-asset refresh — Phase 4

</deferred>

---
*Phase: 01-ownership-contract*
*Context gathered: 2026-03-14*
