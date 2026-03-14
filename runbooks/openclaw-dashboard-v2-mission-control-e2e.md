# OpenClaw Dashboard V2 Mission Control E2E

## Preconditions

- `openclaw-dashboard` dependencies are installed
- the dashboard can run locally
- a Launchpad instance is available in either:
  - local mode
  - backend mode via `AGENT_LAUNCHPAD_API_BASE_URL`
- OpenClaw home is available for the live agent view, or the demo dataset is enabled
- if structured agent state is desired, `~/.openclaw/agents/dashboard.json` or the configured `OPENCLAW_HOME/agents/dashboard.json` includes `currentTask`, `focus`, and `nextHandoff`

## Office team operating model

Use the office team in this order:

1. `main`
- sets the brief and version goal
- keeps repo boundaries clean

2. `product-agent` + `research-agent`
- tighten scope
- confirm Launchpad and framework reuse

3. `coding-agent`
- implements the current slice in `openclaw-dashboard`
- only asks for `agent-workflow` changes if the reusable spec contract is truly needed

4. `qa-agent`
- runs this checklist
- blocks on missing evidence

5. `release-agent`
- writes the acceptance packet and residual risks

## Recommended prompts

### Product framing

```text
Use Office Mode for /Users/clawlyx/Documents/GitHub/openclaw-dashboard.
Goal: build V2 Mission Control focused on Agents and Mission Control.
Use agent-launchpad for task state, agent-workflow for reusable team/workflow specs, and do not move delivery logic into task-center.
First tighten the current version scope and implementation slices.
```

### Implementation

```text
Implement the next V2 Mission Control slice in /Users/clawlyx/Documents/GitHub/openclaw-dashboard.
Keep the dashboard as the operator UI only.
Consume Launchpad APIs for ideas/features/tasks.
Reuse agent-workflow only for portable office/team/workflow definitions if needed.
Run checks and keep going until the slice is acceptance-ready or a real blocker exists.
```

### QA / acceptance

```text
Run the OpenClaw Dashboard V2 Mission Control E2E checklist.
Verify agents visibility, mission-control task visibility, repo binding, and the idea -> feature -> release path.
If there are material gaps, fix them or return a blocker packet.
```

## Test input

Use a real delivery prompt bound to this repo:

```text
Build a highly user-friendly mission control center for OpenClaw with strong Agents visibility and task progress tracking.
```

Suggested Launchpad create payload:

```json
{
  "title": "OpenClaw Dashboard mission control",
  "details": "Build a highly user-friendly mission control center for OpenClaw with strong Agents visibility and task progress tracking.",
  "project": "openclaw",
  "workspace": "office",
  "repo": "openclaw-dashboard",
  "deliveryMode": "pr-required"
}
```

## Flow

1. Start Launchpad and the dashboard.
- Dashboard:
  - `pnpm dev` in `/Users/clawlyx/Documents/GitHub/openclaw-dashboard`
- Launchpad:
  - `pnpm run dev` in `/Users/clawlyx/Documents/GitHub/agent-launchpad`

2. Open the dashboard and verify the live office surface.
- URLs:
  - `/`
  - `/?view=agents&panel=virtual`
  - `/?view=agents&panel=queues`
- Expected:
  - agents render with status, room, and recent activity
  - if structured agent data exists, agent cards show `currentTask`, `focus`, and `nextHandoff`

3. Create a Launchpad idea for `openclaw-dashboard`.
- API:
  - `POST /api/ideas`
- Expected:
  - a new idea is created with repo binding to `openclaw-dashboard`
  - the idea appears in Launchpad overview data

4. Promote the idea into delivery.
- API:
  - `POST /api/ideas/:id/promote`
- Expected:
  - a feature is created
  - the first task lane is visible
  - repo-local artifact paths point under ignored `docs/briefs`, `docs/rfc`, `docs/qa`, and `docs/release`

5. Advance the feature through the office lanes.
- API:
  - `POST /api/features/:id/workflow`
- Actions:
  - `handoff` to `build`
  - `handoff` to `qa`
  - `gate` pass/fail as appropriate
- Expected:
  - Launchpad shows lane and status transitions without inventing dashboard-local state

6. Open the dashboard Mission Control surface after V2 implementation.
- Planned URL:
  - `/?view=mission-control`
- Expected:
  - active tasks are visible
  - blocked work is visible
  - review queue is visible
  - release-ready work is visible
  - the operator can tell which agent or lane owns the next move

7. Verify cross-linking between office state and delivery state.
- Expected:
  - an agent working on a feature/task can be traced to the corresponding Mission Control item
  - handoffs are understandable from both the agent view and the task view

8. Run QA and produce a release packet.
- Expected:
  - the version has a reusable evidence path
  - residual risks are explicit

## Expected states

- `Agents` is the live runtime lens
- `Mission Control` is the delivery lens
- Launchpad remains the source of truth for idea/feature/task state
- the dashboard never stores a second independent workflow state model
- repo-generated workflow artifacts remain local under ignored `docs/` paths

## Validation points

- Dashboard UI:
  - `/`
  - `/?view=agents&panel=virtual`
  - `/?view=agents&panel=queues`
  - planned `/?view=mission-control`
- Dashboard API:
  - `/api/snapshot`
- Launchpad APIs:
  - `/api/dashboard`
  - `/api/features`
  - `/api/tasks`
  - `/api/ideas`

## Acceptance

V2 Mission Control passes when:

- the dashboard can show both live office state and delivery state clearly
- the user can start work through Launchpad and monitor it from the dashboard
- `Agents` and `Mission Control` feel like one office rather than two unrelated products
- repo boundaries are preserved:
  - dashboard UI here
  - Launchpad state there
  - reusable workflow specs in `agent-workflow`

## Known scope limits

- this checklist does not prove full runtime control of OpenClaw itself
- this checklist does not require the dashboard to replace Launchpad's deep detail pages on day one
- this checklist does not justify moving delivery logic back into `task-center`
