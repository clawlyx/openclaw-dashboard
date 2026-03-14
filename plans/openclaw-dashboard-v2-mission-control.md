# OpenClaw Dashboard V2 Mission Control

## Product / version

- Name: `OpenClaw Dashboard`
- Version / phase: `V2 - Mission Control`
- Release target: `1.0.0`

## Goal

- Turn the dashboard from a read-only status board into the primary operator surface for running the OpenClaw office.
- Make two flows trustworthy in one place:
  - `Agents`: who is active, what each agent last worked on, what they are doing now, and what handoff comes next
  - `Mission Control`: what tasks/features are in flight, who owns them, where they are blocked, and what is ready for review or release

## Problem

- `openclaw-dashboard` already visualizes runtime status, but it does not yet own the product-delivery view.
- `task-center`, `agent-launchpad`, and `agent-workflow` now have different jobs, and the dashboard needs to respect those boundaries instead of rebuilding them badly.
- Without a single operator surface, the office feels fragmented:
  - agent presence lives in OpenClaw runtime state
  - delivery/task state lives in Launchpad
  - reusable workflow semantics live in `agent-workflow`
  - the user still has to mentally join these pieces

## Primary users

- KK as the operator running the OpenClaw office
- secondary reviewers who need to understand delivery progress without reading long chat transcripts

## Product boundary

`openclaw-dashboard` should be the glass wall, not the workflow engine.

### Repo responsibilities

- `openclaw-dashboard`
  - read model and operator UI
  - live office visualization
  - mission control visibility
  - lightweight task creation / handoff actions when a stable Launchpad API exists
- `agent-launchpad`
  - idea, feature, task, and review state
  - delivery evidence
  - repo binding
  - workflow mutations such as create idea, promote idea, handoff lane, and gate result
- `agent-workflow`
  - portable `agent-team`, `skills`, `agents`, `workflows`, and `runtime-adapter` specs
  - reusable OpenClaw office definitions if a custom office team/workflow contract is needed
- `task-center`
  - advisory-only workspace
  - not the source of truth for delivery-state mission control

## Core user flow

- Start:
  - the operator opens the dashboard and lands in `Agents` or `Mission Control`
- Key steps:
  - inspect which agents are active, blocked, waiting, or idle
  - see each agent's current task, focus, and next handoff
  - create or open a Launchpad idea/feature bound to `openclaw-dashboard`
  - follow the feature through `research -> build -> qa -> release`
  - review blockers, review queues, and release readiness from the same dashboard
- End state:
  - the operator can assign work and monitor delivery progress without bouncing between chat, runtime files, and multiple product UIs

## In scope

- a new top-level `Mission Control` surface in `openclaw-dashboard`
- explicit mapping between:
  - agent work states: `active`, `blocked`, `waiting`, `idle`, `offline`
  - Launchpad lanes/statuses: `research`, `build`, `qa`, `release` and `ready`, `running`, `review`, `done`, `blocked`
- richer `Agents` workspace expectations:
  - prefer structured `agents/dashboard.json` data when present
  - show `currentTask`, `focus`, `nextHandoff`, `latestActivityKind`, and recent events
- Mission Control data ingestion from `agent-launchpad`
  - dashboard summary
  - feature list
  - task queue / review queue
  - task or feature detail drill-ins
- deep links between:
  - dashboard agent cards
  - Launchpad feature/task detail
  - repo-local workflow artifacts under `docs/briefs`, `docs/rfc`, `docs/qa`, and `docs/release`
- a lightweight create-task flow that starts from Launchpad's existing idea API instead of inventing a second mutation model
- tracked product docs and an E2E runbook for this version

## Out of scope

- building a second persistence model for ideas/features/tasks inside `openclaw-dashboard`
- moving delivery logic back into `task-center`
- replacing Launchpad as the owner of review, PR, or release state
- full host-control actions for OpenClaw runtime
- unrelated dashboard expansion across browser telemetry or scheduler control in this version

## Workstreams

### Foundation / data model

- add a dashboard-side Mission Control data contract that consumes Launchpad APIs rather than raw local files
- add `missionControl` as a first-class branch beside `agents` inside the dashboard snapshot shape instead of overloading `AgentsSnapshot`
- define a small presenter layer that normalizes Launchpad statuses into dashboard-friendly cards, queues, and attention states
- treat `agents/dashboard.json` as the preferred structured source for current task and next handoff, with session inference as fallback

### API / orchestration

- consume Launchpad read APIs:
  - `GET /api/dashboard`
  - `GET /api/features`
  - `GET /api/tasks`
  - optional detail routes for feature/task drill-in
- use Launchpad write APIs for lightweight task creation and progression:
  - `POST /api/ideas`
  - `POST /api/ideas/:id/promote`
  - `POST /api/features/:id/workflow`
- keep degraded-but-usable behavior when Launchpad is unavailable

### UI / operator surface

- keep `Agents` as the live office view
- add `Mission Control` as the delivery view
- show handoffs explicitly so the office reads like a real team instead of a pile of isolated agents
- make `blocked`, `review`, and `ready-to-release` work impossible to miss

### Recovery / observability

- show data source and freshness for both office data and Mission Control data
- keep the dashboard useful when only one side is available:
  - agents available, Launchpad down
  - Launchpad available, structured agent snapshot missing
- never hide whether a value is inferred versus explicitly provided

### Docs / release

- keep tracked version docs in `plans/` and `runbooks/`
- keep Launchpad-generated workflow artifacts local under ignored `docs/` paths
- close the version with a reusable operator E2E path

## Acceptance criteria

- the dashboard has a visible `Mission Control` surface dedicated to delivery progress
- the `Agents` workspace can display structured `currentTask`, `focus`, and `nextHandoff` from `agents/dashboard.json` when present
- the dashboard can read Launchpad task/feature state and show:
  - active work
  - blocked work
  - review queue
  - release-ready work
- the operator can start a new mission through Launchpad's idea API with repo binding to `openclaw-dashboard`
- one feature can be followed end to end from idea through release using the dashboard as the primary operator surface
- the repo split remains clean:
  - dashboard for visualization
  - Launchpad for app-state and workflow mutations
  - `agent-workflow` for reusable office/team/workflow specs

## Risks

- the current dashboard is optimized around local snapshot reads; Launchpad integration adds a second live data plane
- if `agents/dashboard.json` is not maintained, current task and next handoff may remain weaker in live mode than in demo mode
- task vocabulary can drift unless the dashboard mirrors Launchpad lane/status names directly
- there is some repo-history ambiguity around whether workflow ownership lives in `task-center` or `agent-workflow`; V2 should follow the current three-repo split, not older prototype assumptions
- some older `agent-workflow` docs still point runtime ownership at `task-center`; treat those as stale when they conflict with the current three-repo split

## Dependencies

- `openclaw-dashboard`
  - existing agent snapshot support in `lib/agents.ts`
  - existing `getDashboardSnapshot()` composition path in `lib/openclaw.ts`
- `agent-launchpad`
  - `@agent-launchpad/app-models`
  - `/api/dashboard`, `/api/features`, `/api/tasks`, `/api/ideas`, workflow mutation routes
- `agent-workflow`
  - portable team/workflow specs if the OpenClaw office contract needs to be formalized for reuse

## Recommended implementation slices

1. Mission Control read path
- add Launchpad client + dashboard view
- keep this read-only first

2. Agent/task join-up
- map agent `currentTask` / `nextHandoff` to live Mission Control cards
- make blockers and review queues visible in both places

3. Lightweight operator actions
- create idea
- promote to feature/task
- handoff / gate where stable

4. Framework extraction
- if the office contract needs to be reused across repos, define the OpenClaw office team/workflow specs in `agent-workflow` and consume them from Launchpad/dashboard instead of hardcoding them again

## Notes

- This version should be treated as the concrete realization of the earlier `V2` direction in the older repo-local PRD: moving from read-only observation to an operational OpenClaw control surface.
