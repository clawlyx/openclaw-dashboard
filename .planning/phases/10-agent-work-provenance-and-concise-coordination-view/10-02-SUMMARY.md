---
phase: 10-agent-work-provenance-and-concise-coordination-view
plan: 02
subsystem: ui
tags: [agents, virtual-office, coordination, localization]
key-files:
  created: []
  modified:
    - components/agents-virtual-office-panel.tsx
    - components/agents-office-panel.tsx
    - app/globals.css
    - locales/en.json
    - locales/zh.json
requirements-completed: [PROV-01, PROV-03, SUG-03, SIMP-01, SIMP-02, SIMP-03]
completed: 2026-03-16
---

# Phase 10: Plan 02 Summary

Shipped the provenance-aware Agents UI and replaced the old lower-half default with a concise coordination layer.

- Working roster cards now show explicit provenance labels and confidence markers.
- Idle cards and the idle queue now draw from advisory sources with source labels and ranking reasons.
- The lower-half default opens on `Coordination brief`, `Active workloads`, and `Advisory next moves`, while keeping the focused drawer, mission queue, pressure rail, and timeline available below.

Verification:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- Browser verification against demo mode confirmed repo-work provenance, intake provenance, and the concise coordination brief render in the default Agents view

Notes:

- Exec mode stayed local, so no per-task git commits were created during this plan.
