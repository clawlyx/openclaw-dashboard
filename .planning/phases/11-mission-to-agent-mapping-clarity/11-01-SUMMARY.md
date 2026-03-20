---
phase: 11-mission-to-agent-mapping-clarity
plan: 01
subsystem: data-contract
tags: [agents, mission-control, mapping, snapshot]
key-files:
  created: []
  modified:
    - lib/agents.ts
    - lib/openclaw.ts
    - demo/openclaw-home/agents/dashboard.json
requirements-completed: [MAP-01, MAP-02]
completed: 2026-03-17
---

# Phase 11: Plan 01 Summary

Built the Mission Control mapping contract for Agents.

- Added additive agent snapshot fields for Mission Control mapping state, linked task and feature identifiers, mapping evidence, and destination hints.
- Joined live Mission Control context on the server so working agents now expose explicit `exact`, `partial`, or `unavailable` mapping states instead of forcing the UI to infer linkage.
- Refreshed the bundled demo snapshot with deterministic exact, partial, and unavailable mapping cases for Phase 11 verification.

Verification:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `/api/snapshot` inspection confirmed exact, partial, and unavailable Mission Control mapping states are present in the server contract

Notes:

- Exec mode stayed local, so no per-task git commits were created during this plan.
