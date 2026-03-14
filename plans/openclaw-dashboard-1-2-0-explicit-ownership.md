# OpenClaw Dashboard 1.2.0 Explicit Ownership

## Product / version

- Name: `OpenClaw Dashboard`
- Version / phase: `1.2.0`
- Theme: `explicit ownership and office actions`

## Goal

- Turn the current room-level inference into an explicit ownership model that can answer:
  - who owns this mission right now
  - what they last worked on
  - what they plan to do next
  - what is blocked, waiting, or overdue
- Upgrade the `Agents` workspace from a joined read surface into a real operator console.

## Why now

- `1.1.0` proved that joining `Agents` and `Mission Control` in one office view is useful.
- The current join-up still infers ownership from lane and task status.
- That inference is good enough for room-level visibility, but it is not strong enough for:
  - per-agent accountability
  - trustworthy handoff history
  - inline actions
  - stale-pressure signals

## Primary user promise

- The operator should be able to open the office view and understand:
  - the exact owner room
  - the exact owner agent
  - the active task
  - the next planned step
  - whether action is needed now
- The operator should be able to take common task actions without switching back to `Mission Control`.

## In scope

- explicit ownership fields in the dashboard snapshot and Mission Control join layer
- task references on agents:
  - `currentTaskId`
  - `lastTaskId`
  - `nextTaskId`
- ownership fields on mission tasks:
  - `ownerAgentId`
  - `ownerRoomId`
  - `startedAt`
  - `lastWorkedAt`
  - `nextPlannedStep`
  - `blockedReason`
  - `waitingOn`
- an `Agent / Room Detail Drawer` inside `Agents`
- inline office actions for the common task transitions already supported by Mission Control
- stale-pressure signals for overdue review, blocked-too-long, no-owner, and overloaded rooms
- demo dataset updates so the public preview shows the new ownership model safely

## Out of scope

- replacing Launchpad as the source of truth for task and feature state
- inventing a second persistence model inside `openclaw-dashboard`
- adding broad new workspaces unrelated to ownership and execution
- full runtime control of OpenClaw host processes
- speculative multi-user collaboration features

## Workstreams

### 1. Snapshot contract

- extend the mission/task shape so ownership is explicit instead of inferred
- extend the agent shape so task references are structured instead of free-text only
- preserve fallback behavior:
  - if explicit ownership is missing, show inferred ownership as inferred
  - never silently present inference as ground truth

### 2. Join and presenter layer

- add a dashboard-side ownership presenter that joins:
  - `agents`
  - `missionControl`
  - room definitions
- expose:
  - owner agent
  - owner room
  - last step
  - next step
  - pressure state

### 3. Detail drawer

- clicking a room or agent opens a detail drawer
- drawer should show:
  - current mission
  - current task
  - last completed task
  - next planned step
  - blocker / waiting reason
  - recent handoff chain
  - artifact / PR / branch links when available

### 4. Inline office actions

- support the most common safe actions from the office surface:
  - `advance`
  - `block`
  - `ready`
  - `request review`
- actions should reuse existing Mission Control mutation rules
- unsupported transitions should remain visible but disabled, not hidden

### 5. Pressure signals

- stale review
- blocked-too-long
- no owner
- room overload
- waiting on human
- pressure should appear in both summary cards and detail surfaces

## Recommended implementation slices

### Slice 1: explicit ownership contract

- add ownership fields to task and agent snapshot shapes
- update demo data and presenters
- keep UI changes minimal while the contract stabilizes

### Slice 2: room and agent detail drawer

- build the drawer shell
- wire current task, last task, next step, and blocker state
- make drawer reachable from room cards, mission cards, and desk cards

### Slice 3: inline office actions

- wire the office drawer and mission queue cards to supported mutations
- keep optimistic UI simple and use server truth for final state

### Slice 4: stale-pressure pass

- add age-based signals and attention ordering
- make the office answer “what needs intervention first?”

## Dependencies

- `missionControl` snapshot remains the source for task and feature state
- `agents` snapshot needs either:
  - explicit task refs from runtime state, or
  - a documented fallback strategy when only session inference is available
- demo data must be updated so public screenshots remain representative

## Acceptance criteria

- at least one live task has explicit `ownerAgentId` and `ownerRoomId` in the snapshot path
- the office view can show explicit owner agent and owner room without lane-based guessing
- clicking a room or agent opens a detail drawer with:
  - current task
  - last task
  - next step
  - blocker / waiting reason
- supported task actions can be triggered from the office view
- stale-pressure signals reorder the attention surfaces meaningfully
- the UI still works when ownership fields are missing, and clearly labels inferred fallback

## Risks

- runtime ownership data may lag behind task state unless update semantics are explicit
- adding too many actions to the office view can make the surface noisy
- stale-pressure heuristics can create false urgency if thresholds are weak
- drawer scope can balloon unless it stays focused on ownership and next action

## Release criteria

- the office can answer “who owns this?” without inference in the happy path
- the operator can inspect and act on a task from the office view alone
- the fallback path remains readable when only partial ownership data exists
- demo screenshots and README copy are refreshed for the new surface

## Non-goals for this version

- full workflow automation
- agent scheduling logic
- cross-repo office orchestration beyond current Mission Control boundaries
