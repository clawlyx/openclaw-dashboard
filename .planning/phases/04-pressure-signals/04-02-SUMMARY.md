---
phase: 04-pressure-signals
plan: 02
subsystem: release
tags: [release, demo-data, screenshots, docs, validation]
requires:
  - phase: 04-pressure-signals
    provides: reusable office pressure model and verified attention routing
provides:
  - bundled demo state aligned to the pressure milestone
  - `1.2.0` release metadata and public docs
  - refreshed README and social assets generated from demo data
affects: [demo-safety, release-docs, github-homepage]
tech-stack:
  added: []
  patterns:
    - public-safe screenshot workflow pinned to bundled demo agents plus bundled mission-control sample state
key-files:
  created:
    - runbooks/openclaw-dashboard-1-2-0-release-candidate.md
  modified:
    - lib/mission-control.ts
    - demo/openclaw-home/agents/dashboard.json
    - package.json
    - CHANGELOG.md
    - README.md
    - README.zh-CN.md
    - .github/assets/readme-demo.png
    - .github/assets/readme-mobile.png
    - .github/assets/preview-mission-control.png
    - .github/assets/social-preview.png
key-decisions:
  - "Treat the bundled mission-control sample as the canonical public-safe source instead of relying on temp state for screenshots."
  - "Fix the README demo command so it also detaches Mission Control from a real local Launchpad home."
patterns-established:
  - "Public previews now require both OPENCLAW_HOME and AGENT_LAUNCHPAD_HOME controls when validating workstation screenshots."
requirements-completed:
  - PRES-01
  - PRES-02
  - PRES-03
duration: 1 session
completed: 2026-03-14
---

# Phase 4: Pressure Signals Summary

**The `1.2.0` milestone is packaged with pressure-safe demo data, refreshed docs, and public assets**

## Performance

- **Duration:** 1 session
- **Started:** 2026-03-14T18:38:00-04:00
- **Completed:** 2026-03-14T19:50:00-04:00
- **Tasks:** 3
- **Files modified:** 10
- **Files created:** 1

## Accomplishments

- Aligned the bundled mission-control sample with the verified pressure scenarios so demo mode naturally shows stale review, blocked-too-long, waiting-on-human, inferred ownership, and overloaded rooms.
- Refreshed the bundled demo agent state so room ownership, desk copy, and recent events match the `1.2.0` pressure milestone.
- Bumped the app to `1.2.0`, updated the changelog and READMEs, and corrected the public demo command so Mission Control also stays on bundled sample data.
- Captured fresh README and social assets from the bundled demo dataset only.

## Task Commits

All execution tasks landed in the same release-prep commit:

1. **Task 1: Refresh demo state for pressure-safe screenshots** - `9e86afe` (chore)
2. **Task 2: Prepare the `1.2.0` release candidate docs and metadata** - `9e86afe` (chore)
3. **Task 3: Capture refreshed public assets and verify the milestone** - `9e86afe` (chore)

**Plan metadata:** `25c9f9b` (docs)

## Files Created/Modified

- `lib/mission-control.ts` - Expands the bundled Launchpad sample with inferred ownership, waiting-human, and blocked build pressure examples.
- `demo/openclaw-home/agents/dashboard.json` - Aligns office agents, task refs, queues, and recent events to the `1.2.0` pressure story.
- `package.json` - Bumps the app version to `1.2.0`.
- `CHANGELOG.md` - Records the explicit-ownership and pressure milestone.
- `README.md` - Updates public positioning, feature bullets, and the safe demo command for both datasets.
- `README.zh-CN.md` - Mirrors the public positioning and safe demo command updates in Chinese.
- `runbooks/openclaw-dashboard-1-2-0-release-candidate.md` - Captures the final review path and acceptance criteria for `1.2.0`.
- `.github/assets/readme-demo.png` - Refreshed desktop README preview from bundled demo data.
- `.github/assets/readme-mobile.png` - Refreshed mobile README preview from bundled demo data.
- `.github/assets/preview-mission-control.png` - Refreshed Mission Control preview from bundled demo data.
- `.github/assets/social-preview.png` - Refreshed social preview from bundled demo data.

## Decisions Made

- Kept the pressure milestone public-safe by proving it with bundled sample data instead of screenshotting real Launchpad state.
- Updated the README demo instructions to include `AGENT_LAUNCHPAD_HOME`, because otherwise a machine with a real Launchpad install would leak live mission data into “demo” screenshots.

## Deviations from Plan

None - plan executed as scoped.

## Issues Encountered

- The existing README implied that `OPENCLAW_HOME=demo/openclaw-home` was enough for a safe public preview. That was incomplete because Mission Control still preferred `~/.agent-launchpad`. The release pass corrected both the docs and the validation path.

## User Setup Required

None for validation. Reviewers can use:

```bash
OPENCLAW_HOME=demo/openclaw-home AGENT_LAUNCHPAD_HOME=/tmp/openclaw-dashboard-demo pnpm start
```

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- Browser-verified bundled demo Agents workspace on `/?view=agents&panel=virtual&lang=en`
- Browser-verified bundled demo pressure-card click routing from `Waiting on human` into the `Review Booth` task drawer
- Browser-verified refreshed README and Mission Control screenshots captured from bundled demo data only

## Next Phase Readiness

- Phase 4 is complete and the `1.2.0` milestone is packaged.
- The next GSD action should be milestone completion and archival, not another execution phase.

---
*Phase: 04-pressure-signals*
*Completed: 2026-03-14*
