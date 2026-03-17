# OpenClaw Dashboard Mission Archive Boundary

## Status

- The original V2 Mission Control integration plan is archived as historical context.
- Phase 9 established the current contract: repo-bound task systems are retired, and Mission Control keeps only local archive data plus the intentional personal-research `TQ-XXX` queue.

## Current boundary

- `openclaw-dashboard`
  - operator UI
  - mission archive visibility
  - local archive-state mutations
  - bundled sample data for demo and first-run fallback
- retired repo-task systems
  - `task-center`
  - `agent-launchpad`
  - `agent-workflow`
  - these remain historical context only and are not treated as live runtime dependencies here

## Surviving task rule

- keep only legitimate personal research `TQ-XXX` items
- archive or remove repo-bound `TQ-*` rows from bundled/demo-facing data
- make keep/archive/remove decisions visible in Mission Control notes and verification steps

## Operator expectations

- Mission Control is the local archive lens, not a bridge back into retired repo-task systems
- fallback data must say when it is bundled sample data
- follow-on work in Phase 10 can add richer provenance and coordination UI without inheriting the old three-system split

## Phase 10 Provenance Contract

- working agents may expose one or more `workloads` entries
- each workload carries:
  - `sourceKind` such as `repo-work`, `personal-research`, or `coordination`
  - explicit repo or thread labels when metadata is available
  - a confidence marker so partial fallbacks never read like exact truth
- idle guidance lives under `agents.advisorySuggestions`
- advisory suggestions can come from:
  - local repo phase plans under `.planning/phases`
  - surviving personal-research tasks from the mission archive
- these suggestions remain hints only and do not restore `task-center`, `agent-launchpad`, or `agent-workflow` as ownership systems

## Coordination Surface

- the Agents lower half should open on a concise coordination brief
- default scan path:
  - active workloads
  - advisory next moves
  - focused owner detail / task queue / pressure rail
- deeper analytics can still exist, but the shipped default should emphasize actionable coordination before broad comparison views

## Manual verification

Use [runbooks/openclaw-dashboard-v2-mission-control-e2e.md](runbooks/openclaw-dashboard-v2-mission-control-e2e.md) to confirm:

- source messaging names the mission archive contract
- only the intended personal research `TQ-091` and `TQ-101` items survive in bundled data
- build/release repo-task lanes stay retired in both Mission Control and the demo office snapshot
- Agents shows exact repo-work and intake provenance in demo mode, plus partial fallback wording where metadata is incomplete
- advisory next moves explain source and ranking reason without reviving archived ownership semantics
