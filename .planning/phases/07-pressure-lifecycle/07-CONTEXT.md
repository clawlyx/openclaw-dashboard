# Phase 7: Pressure Lifecycle - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Show whether pressure is worsening or improving, make that judgment explainable to the operator, and finish the milestone with safe demo and release packaging. This phase is about lifecycle meaning, where that meaning shows up in triage, and how the milestone gets packaged publicly. It is not about inventing a new scoring engine or expanding the roadmap beyond operator intelligence.

</domain>

<decisions>
## Implementation Decisions

### Lifecycle semantics
- Lifecycle state should treat operator-visible status change as the strongest signal.
- If the visible state did not change, duration and pressure trend can be used as the secondary signal.
- The UI should not call something "improving" just because the slope softened while the work is still clearly unhealthy.
- The practical lifecycle framing should distinguish new pressure from long-running pressure, and improving pressure from worsening pressure.

### Visibility model
- Lifecycle state should appear first in the operator summary and pressure rail, because those are the operator's triage surfaces.
- Detail views should explain the lifecycle judgment rather than forcing every room or mission card to carry another badge.
- Avoid spraying lifecycle labels across every card by default; summary-first visibility keeps the workstation readable.

### Explainability and trust
- Use progressive disclosure.
- Summary surfaces should show a short reason line that explains why a signal is slipping or recovering.
- Detail views can show richer supporting evidence such as recent metrics or timeline context.
- The operator should be able to trust the lifecycle label without reading raw history, but should still be able to inspect the justification when needed.

### Milestone packaging
- Phase 7 should finish the milestone with a public-release packaging set.
- Refresh demo data, screenshots, README / README.zh-CN, and changelog/versioning artifacts.
- Validation assets should remain safe to publish and should reflect the pressure lifecycle milestone accurately.

### Claude's Discretion
- Exact lifecycle label names and threshold boundaries, as long as status-change-first semantics remain intact.
- Exact placement and visual treatment of the reason line in operator summary and pressure rail.
- Exact detail-view evidence format, as long as it stays richer than summary copy without cluttering overview surfaces.

</decisions>

<specifics>
## Specific Ideas

- Treat lifecycle as a lightweight interpretation layer on top of the existing pressure and history model rather than a separate scoring system.
- Add short summary copy such as why a signal is worsening or recovering, then let the detail surface expand into the evidence.
- Keep packaging work aligned with the milestone-finish role of Plan 07-02 instead of treating it like an optional cleanup pass.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/pressure-signals.ts` already computes explainable pressure signals and severity from snapshot data.
- `components/agents-virtual-office-panel.tsx` already owns the operator summary, pressure rail, room intelligence surfaces, and detail-view presentation where lifecycle cues can attach.
- `lib/dashboard-presenters.ts` and localized strings in `locales/en.json` / `locales/zh.json` provide the current wording layer that lifecycle copy should extend.
- Existing demo and public asset workflow from prior milestone packaging can be reused for screenshots, README refresh, and safe validation.

### Established Patterns
- Pressure remains snapshot-derived and explainable rather than machine-learned.
- Summary surfaces already condense task and room pressure for triage, which matches the chosen summary-first lifecycle visibility model.
- Detail views already carry more context than top-level surfaces, which matches the progressive-disclosure trust model.

### Integration Points
- `lib/pressure-signals.ts`
- `components/agents-virtual-office-panel.tsx`
- `locales/en.json`
- `locales/zh.json`
- `demo/openclaw-home/...`
- `README.md`
- `README.zh-CN.md`
- `CHANGELOG.md`
- `package.json`

</code_context>

<deferred>
## Deferred Ideas

- Predictive bottleneck forecasting beyond explainable recent-trend interpretation
- Broader runtime or workstation control surfaces
- Any roadmap expansion beyond finishing the `1.3.0` operator intelligence milestone

</deferred>
