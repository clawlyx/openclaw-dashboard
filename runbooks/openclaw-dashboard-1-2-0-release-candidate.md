# OpenClaw Dashboard 1.2.0 Release Candidate

## Theme

`Explicit ownership x office pressure`

## Why 1.2.0

- `1.1.0` connected the office view to Mission Control at the room level.
- `1.2.0` makes that join-up explicit and operator-ready:
  - agents and tasks now point at each other directly
  - the office drawer can show the real task path and linked artifacts
  - common Mission Control actions are available from the office surface
  - pressure signals now tell the operator what needs attention next

## Delivered in this branch

- explicit ownership/task references in the snapshot contract
- room and agent detail drawers with current mission, handoffs, and artifact evidence
- inline office actions that reuse Mission Control transitions
- a pressure rail for stale review, blocked-too-long, waiting-on-human, inferred ownership, and room overload
- refreshed bundled demo data and public screenshots aligned to the `1.2.0` workstation milestone

## Acceptance evidence

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- browser-verified `Agents -> Virtual office` against the bundled demo dataset
- browser-verified pressure rail rendering stale review, blocked-too-long, waiting-on-human, and inferred ownership
- browser-verified room-level pressure cues in the office room grid
- browser-verified pressure-card click routing into the owning room or task drawer
- browser-verified refreshed README/social screenshots captured from bundled demo data only

## Preconditions for reviewer

- start the app locally with the bundled demo dataset:

```bash
OPENCLAW_HOME=demo/openclaw-home AGENT_LAUNCHPAD_HOME=/tmp/openclaw-dashboard-demo pnpm start
```

- open `/?view=agents&panel=virtual&lang=en`
- verify the header shows `Demo dataset`

## Merge expectation

Ship this as `1.2.0` when branch review confirms:

- the `Agents` workspace answers what needs attention next without leaving the office
- drawer ownership and mission path stay consistent with Mission Control task truth
- office actions do not diverge from Mission Control transitions
- public screenshots and README copy reflect the actual demo state

## Rollback / recovery

- revert the `1.2.0` merge commit if explicit ownership or pressure cues create incorrect operator routing
- fallback behavior is the `1.1.0` room-level join-up without the new pressure-signal surface
