---
phase: 10
slug: agent-work-provenance-and-concise-coordination-view
status: complete
created: 2026-03-16
updated: 2026-03-16T00:00:00Z
---

# Phase 10 Research

## Question

What does the repo need in order to plan Phase 10 well?

## Current State

- `lib/agents.ts` can read either `agents/dashboard.json` or raw session folders, but the derived model only exposes one coarse status row per agent plus a few task/model fields.
- `components/agents-virtual-office-panel.tsx` currently computes idle suggestions directly from Mission Control tasks, and its lower half is split across several dense rails.
- `lib/openclaw.ts` already owns top-level snapshot aggregation, so it is the safest place to introduce additional advisory source readers if Phase 10 needs repo-wide pending-work inputs.
- Phase 9 removed the old repo-task bridge, so Phase 10 must not reintroduce `task-center`, `agent-launchpad`, or `agent-workflow` as live sources of repo execution truth.

## Planning Implications

### 1. Additive provenance contract beats UI-side inference

Phase 10 should push repo/thread provenance into the server snapshot layer instead of teaching the client to infer it from room labels, task IDs, or ad hoc string parsing. The contract should stay additive so existing snapshots still render while richer installs expose:

- active session provenance for `#repo-work` and `#intake`
- repo name, thread label, and task/work item summary
- multiple concurrent workload entries when an agent is serving more than one active session
- an explicit source/fallback note when provenance is partial rather than guessed

### 2. Suggestion sourcing should be broader, but still advisory

The current idle queue only looks at ready unowned Mission Control tasks. Phase 10 needs a separate advisory-source layer that can rank:

- open tracked repo GSD work that is ready to start or unblock
- actionable personal research items from intake-style threads
- existing Mission Control ownership data where it is still useful

This source layer should explain why a suggestion is shown and never read like auto-assignment.

### 3. The lower half should collapse into coordination, not analytics sprawl

The virtual office panel currently keeps operator summary, bottlenecks, intelligence, room pulse, mission queue, desk feed, attention, and timeline visible in one large surface. Phase 10 should replace that with a smaller coordination layer centered on:

- what active agents are serving right now
- what idle agents could credibly pick up next
- what blocker or handoff needs operator attention

Detailed room analytics can remain accessible through focus state or drawers, but the default scan path should get shorter.

### 4. Backward compatibility matters on live local installs

The repo already supports configured snapshots, derived filesystem snapshots, and demo fallback data. Phase 10 plans should preserve all three by:

- keeping new provenance fields optional
- deriving sensible fallback labels when metadata is missing
- updating demo fixtures so the UI can exercise repo-work, intake, and multi-session states deterministically

## Recommended Plan Shape

- Plan 10-01: Build the provenance and suggestion-source contract in the snapshot layer.
- Plan 10-02: Rework the Agents surfaces to show working provenance, suggestion reasoning, and a concise coordination layout.
- Plan 10-03: Refresh fixtures, docs, and the operator verification path so the new provenance model is inspectable and repeatable.

## Risks To Guard Against

- Reintroducing archived repo-task semantics through new backlog readers or copy.
- Letting the client component own even more source-joining logic instead of moving that logic server-side.
- Showing partial provenance as if it were exact truth.
- Making the lower-half redesign visually simpler but operationally less useful.

## Validation Architecture

### Automated Baseline

- `pnpm typecheck` should stay the per-task fast feedback command for contract and UI changes.
- `pnpm lint` should catch JSX/CSS/localization drift before wave completion.
- `pnpm build` should remain the release-level structural check.

### Manual Coverage Needed

- Browser verification is still required for multi-session provenance chips, advisory queue explanations, and the simplified lower-half coordination scan path.
- `/api/snapshot` inspection is the quickest way to verify that provenance and suggestion fields come from the server contract rather than client-only inference.
- Demo snapshot checks are required so the feature is testable even when local OpenClaw metadata is sparse.

### Suggested Validation Split

- Wave 1 validates snapshot shape, source notes, and demo data examples.
- Wave 2 validates working/blocked/idle presentation, advisory phrasing, and simplified coordination behavior in the browser.
- Wave 3 validates README/runbook instructions and the repeatable manual verification path.
