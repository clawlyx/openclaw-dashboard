# OpenClaw Dashboard 1.2.0 Explicit Ownership E2E

## Preconditions

- run the app locally with `pnpm start` or `pnpm dev`
- use either:
  - a real OpenClaw + Launchpad state that includes explicit ownership fields, or
  - the bundled demo dataset updated for `1.2.0`
- open `/?view=agents&panel=virtual&lang=en`

## Test input

- at least one mission task with:
  - `ownerAgentId`
  - `ownerRoomId`
  - `nextPlannedStep`
  - `blockedReason` or `waitingOn`
- at least one review task old enough to trigger a stale-pressure signal

## Flow

### 1. Snapshot contract

- open `/api/snapshot`
- confirm `agents.agents[*]` can expose task references like `currentTaskId`
- confirm `missionControl` tasks expose explicit ownership fields
- confirm the joined UI does not need lane/status inference for the happy path

### 2. Office overview

- open `Agents -> Virtual office`
- confirm room cards show explicit owner room and top mission state
- confirm at least one summary or attention surface highlights stale pressure

### 3. Room / agent detail drawer

- click a room with active mission ownership
- confirm the drawer shows:
  - owner room
  - owner agent
  - current task
  - last completed task
  - next planned step
  - blocker / waiting reason

### 4. Mission-to-owner navigation

- click a mission queue card
- confirm the office focuses the correct room
- click the owner agent
- confirm the drawer remains scoped to that exact owner

### 5. Inline office actions

- from the office drawer or mission queue card, trigger one supported action
- confirm the mutation succeeds
- confirm the UI refreshes from server truth
- confirm the task state also matches in `Mission Control`

### 6. Fallback path

- remove or suppress explicit ownership for one demo task
- confirm the office still renders
- confirm inferred ownership is labeled or otherwise distinguishable from explicit ownership

## Pages / APIs to inspect

- `/?view=agents&panel=virtual&lang=en`
- `/?view=mission-control&lang=en`
- `/api/snapshot`

## Acceptance criteria

- explicit owner agent and owner room appear in the office surface
- drawer content is specific enough to answer “what is this person doing next?”
- inline actions work from the office view for supported transitions
- stale-pressure signals correctly surface overdue items
- fallback mode stays readable when explicit ownership is absent

## Known scope limits

- this runbook does not require full host-runtime control
- this runbook assumes Mission Control remains the task source of truth
- unsupported workflow transitions may remain Mission Control-only in this version
