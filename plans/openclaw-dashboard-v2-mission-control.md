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

## Phase 11 Mapping Contract

- `agents.missionMapping` carries the Mission Control join for a desk when one can be resolved
- each mapping exposes:
  - `state`: `exact`, `partial`, or `unavailable`
  - linked `taskId` / `featureId` context when trustworthy
  - `destination` hints for the closest `Mission Control` panel
  - source notes that explain why the mapping is exact, partial, or unavailable
- exact links come from live task references or direct Mission Control ownership evidence
- partial links stay advisory and point to nearby task or feature context without reassigning ownership
- unavailable links are first-class and must not render as fake Mission Control navigation

## Phase 11 Handoff Expectations

- Agents may summarize linked Mission Control context, but Mission Control remains the ownership source of truth
- an exact or partial handoff from Agents should land on the closest relevant Mission Control task, review queue, or feature context
- Mission Control should explain when a landing is partial fallback context instead of an exact task match
- repo-bound execution work may remain visible as provenance in Agents even when Mission Control has no trustworthy live mapping for it

## Phase 12 Coordination Reflection Contract

- `agents.overlapGroups` describes active shared-work clusters that look either intentional (`parallel`) or risky (`ambiguous`)
- `agents[].coordination` carries per-agent priority plus recent handoff context when the snapshot has trustworthy evidence
- exact and partial Agents handoff URLs may add `missionAgent` and `missionGroup` so Mission Control can recover the same coordination focus
- Mission Control may render that focus as banner context, but it must continue to treat Mission Control task data as the ownership truth
- overlap cases with no exact Mission Control task must stay explicit fallback context rather than implying a hidden match
- intervention-needed overlap should read as higher priority than routine parallel work across the existing Mission Control panels

## Phase 13 Default Guidance Contract

- `agents.coordinationRecommendationState` explicitly says whether the current snapshot has one recommended next move or a calm no-recommendation state
- `agents.coordinationRecommendation` carries one chosen move only, with:
  - destination surface (`agents` or `mission-control`)
  - best-known destination context when confidence is high
  - one concise, evidence-backed reason
- the recommendation is advisory context only; it must not move task ownership truth out of Mission Control
- bundled demo verification must cover:
  - default intervene path
  - watch fallback path
  - calm no-recommendation path
- Mission Control should repeat the recommendation reason on recommended landings so the cross-surface move feels continuous instead of disconnected

## Manual verification

Use [runbooks/openclaw-dashboard-v2-mission-control-e2e.md](runbooks/openclaw-dashboard-v2-mission-control-e2e.md) to confirm:

- source messaging names the mission archive contract
- only the intended personal research `TQ-091` and `TQ-101` items survive in bundled data
- build/release repo-task lanes stay retired in both Mission Control and the demo office snapshot
- Agents shows exact repo-work and intake provenance in demo mode, plus partial fallback wording where metadata is incomplete
- Agents shows exact / partial / unavailable Mission Control mapping states and only exposes a handoff when the destination is trustworthy
- Agents and Mission Control repeat the same overlap-group, handoff, and intervention-priority picture for the selected context
- Agents and Mission Control repeat the same recommended-next-move reason on recommended landings, while keeping Mission Control as the task source of truth
- advisory next moves explain source and ranking reason without reviving archived ownership semantics
