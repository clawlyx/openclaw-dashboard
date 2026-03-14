# OpenClaw Dashboard 1.0.0 Release Candidate

## Theme

`Mission Control workstation`

## Why 1.0.0

- `0.4.0` was still a read-heavy dashboard.
- `1.0.0` is the first release where the app can act like a real workstation:
  - operators can inspect the office
  - operators can create a mission from inside the dashboard
  - operators can move task work through the queue without leaving the app

## Delivered in this branch

- top-level `Mission Control` workspace with mission, queue, review, and release panels
- live Launchpad-backed `missionControl` snapshot branch beside `agents`
- in-app mission intake flow using Launchpad-style state mutation
- in-app task controls for queue progression:
  - `ready -> running`
  - `running -> review`
  - `review -> next lane`
  - `blocked -> ready`
- ignored workflow artifact generation under `docs/briefs`, `docs/rfc`, `docs/qa`, and `docs/release`

## Acceptance evidence

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- browser-verified Mission Control read path
- browser-verified mission intake flow against isolated temp Launchpad state
- browser-verified queue action flow against isolated temp Launchpad state
- browser-verified remote workflow action flow against a real temp `agent-launchpad` backend
- `/api/snapshot` verified to expose the updated `missionControl` branch

## Known limits before merge

- remote Launchpad write APIs are now smoke-verified against the Launchpad backend for `block`, `ready`, and research-review `advance`
- release/PR evidence still depends on Launchpad/runtime data; the dashboard is not inventing its own PR state
- the app package name remains `openclaw-dashboard`; the workstation framing is a product/version milestone, not a repo rename

## Merge expectation

Ship this as `1.0.0` when the branch review confirms:

- the Agents workspace still behaves correctly
- Mission Control stays readable on desktop and mobile
- the local Launchpad-backed mutation flows are acceptable for the release boundary
