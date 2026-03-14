# OpenClaw Dashboard 1.1.0 Release Candidate

## Theme

`Agents x Mission Control join-up`

## Why 1.1.0

- `1.0.0` proved the workstation model with separate `Agents` and `Mission Control` surfaces.
- `1.1.0` is the first release that joins those surfaces together inside the office view:
  - operators can see which room owns live mission work
  - operators can inspect room-scoped mission queue items without leaving `Agents`
  - operators can click a mission and jump straight to the owning room

## Delivered in this branch

- room-level mission ownership derived from live `missionControl` queue state
- `Agents` virtual office room cards enriched with mission title, task title, and review/block pressure
- inline mission queue rail inside the office view
- mission queue cards that focus the owning room directly
- focused-room desk feed behavior that still shows offline owners when a room is selected

## Acceptance evidence

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- browser-verified `Agents -> Virtual office` on a local preview
- browser-verified room cards showing live mission ownership
- browser-verified mission queue rail rendering in the all-rooms state
- browser-verified clicking a mission queue card focuses the owning room
- browser-verified focused `Review Booth` still shows the offline QA desk instead of an empty state

## Preconditions for reviewer

- start the app locally with `pnpm start` or `pnpm dev`
- open `/?view=agents&panel=virtual&lang=en`
- ensure the snapshot has both `agents` and `missionControl` data

## Merge expectation

Ship this as `1.1.0` when branch review confirms:

- the `Agents` workspace stays readable on desktop and mobile
- room mission ownership stays consistent with Mission Control queue state
- focused-room navigation makes ownership clearer instead of noisier
- no existing `Mission Control` interactions regress

## Rollback / recovery

- revert the `1.1.0` merge commit if the office join-up causes confusion or bad filtering behavior
- fallback behavior is the `1.0.0` split: `Agents` remains a status board and `Mission Control` remains the task surface
