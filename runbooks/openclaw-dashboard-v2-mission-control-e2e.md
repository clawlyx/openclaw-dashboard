# OpenClaw Dashboard Mission Archive E2E

## Preconditions

- `openclaw-dashboard` dependencies are installed
- the dashboard can run locally
- `OPENCLAW_HOME` points at a live install or `demo/openclaw-home`
- `MISSION_CONTROL_HOME` points at:
  - an empty temp directory when you want bundled-sample read verification
  - a writable local mission archive directory when you want to verify local mutations

## Intent

Phases 9 and 10 now define the operator contract. This checklist proves:

- repo-bound task systems stay archived rather than returning as runtime ownership truth
- working agents show trustworthy repo-work or intake-thread provenance
- working agents show exact, partial, or unavailable Mission Control mapping state without claiming ownership moved into Agents
- idle suggestions stay advisory while drawing from both repo plans and personal research
- the default lower-half Agents surface is concise and action-oriented
- exact and partial Agents mappings can hand off into the closest relevant Mission Control context

## Verification flow

1. Start the dashboard with the bundled datasets.
- Command:
  - `OPENCLAW_HOME=demo/openclaw-home MISSION_CONTROL_HOME=/tmp/openclaw-dashboard-demo pnpm dev`

2. Open the main operator views.
- URLs:
  - `/`
  - `/?view=agents&panel=virtual`
  - `/?view=mission-control`

3. Confirm the archive-era runtime contract.
- Expected:
  - Mission Control source text references a local mission archive or bundled archive sample
  - no UI copy presents `task-center`, `agent-launchpad`, or `agent-workflow` as live repo-task dependencies
  - repo-bound release/build pressure is absent from the bundled Mission Control queue

4. Confirm the surviving `TQ-XXX` set.
- Expected:
  - `TQ-091` and `TQ-101` are visible as personal research tasks
  - both tasks live in the `research` lane
  - no repo-bound `TQ-*` records such as old build/release items appear in Mission Control

5. Confirm the bundled office snapshot matches the cleanup.
- Expected:
  - the research room still shows live work for the surviving personal research queue
  - build and release agents do not advertise old repo-bound `TQ-*` ownership from retired systems
  - recent activity mentions the archive boundary instead of an active Launchpad workflow bridge

6. Confirm working-agent provenance and Mission Control mapping in `Agents`.
- URL:
  - `/?view=agents&panel=virtual`
- Expected:
  - working roster cards show `Provenance`
  - working roster cards also show `Mission Control` state as exact, partial, or unavailable
  - bundled demo data shows a repo-work case for `Coding Agent`
  - bundled demo data shows an intake-style personal-research case for `Research Agent`
  - bundled demo data shows:
    - an exact Mission Control task link for `Research Agent`
    - a partial review-context link for `Main Console`
    - an unavailable Mission Control link for `Coding Agent`
  - `Coding Agent` exposes more than one workload entry in `/api/snapshot`
  - any fallback cases are labeled as partial rather than reading like exact truth

7. Confirm the Agents-to-Mission Control handoff.
- Expected:
  - exact or partial mapping cards expose `Open in Mission Control`
  - unavailable mappings do not expose a fake navigation action
  - opening the `Research Agent` handoff lands on a highlighted `TQ-101` review context
  - opening the `Main Console` handoff lands on nearby Mission Control review context with partial-language copy

8. Confirm the concise coordination layer.
- Expected:
  - the lower-half default view shows `Coordination brief`
  - `Active workloads` and `Advisory next moves` appear before deeper rails
  - advisory cards explain source and ranking reason
  - the language stays suggestive and does not imply automatic staffing or restored ownership

9. Confirm API behavior for local archive mutations and retired remote mutation paths.
- Commands:
  - Start from a writable local archive state (not the bundled sample): `rm -rf /tmp/openclaw-dashboard-local && OPENCLAW_HOME=demo/openclaw-home MISSION_CONTROL_HOME=/tmp/openclaw-dashboard-local pnpm dev`
  - Seed a local task: `curl -s -X POST http://localhost:3000/api/mission-control/intake -H 'content-type: application/json' -d '{"title":"Test","details":"Archive check"}' > /tmp/openclaw-intake.json`
  - Extract the created task id: `jq -r '.createdTask.tqId' /tmp/openclaw-intake.json`
  - Mutate that local task: `curl -i -X PATCH http://localhost:3000/api/mission-control/tasks/<created-task-id> -H 'content-type: application/json' -d '{"action":"start"}'`
- Expected:
  - local mutations succeed when using writable local archive state
  - the bundled sample remains a read fixture for the surviving `TQ-091` / `TQ-101` verification and should not be treated as mutable archive state
  - if a legacy remote API env var is set, the route returns `410` with an archive-era error instead of proxying the old repo-task bridge

## Acceptance

The shipped operator contract is valid when:

- Mission Control reads from the local archive contract and bundled sample cleanly
- only intentional personal research `TQ-XXX` items remain visible in the surviving archive queue
- Agents shows repo-work and intake provenance without guessing from room labels alone
- Agents shows exact / partial / unavailable Mission Control mapping states and only links to Mission Control when the destination is trustworthy
- advisory next moves remain non-owning and explain why they are being suggested
- the concise coordination layer reduces the default scan path without hiding the pressure rail or detailed drawer
