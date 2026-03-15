---
phase: 7
slug: pressure-lifecycle
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-15
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript + ESLint + Next.js build validation |
| **Config file** | `tsconfig.json`, `eslint.config.mjs`, `next.config.ts` |
| **Quick run command** | `pnpm typecheck` |
| **Full suite command** | `pnpm check` |
| **Estimated runtime** | ~60 seconds |
| **Demo launch command** | `OPENCLAW_HOME=demo/openclaw-home AGENT_LAUNCHPAD_HOME=/tmp/openclaw-dashboard-demo pnpm start` |

---

## Sampling Rate

- **After every task commit:** Run `pnpm typecheck`
- **After every plan wave:** Run `pnpm check`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | OPER-03 | static + data model | `pnpm typecheck` | ✅ | ✅ green |
| 7-01-02 | 01 | 1 | ROOM-03 | lint + UI integration | `pnpm lint` | ✅ | ✅ green |
| 7-01-03 | 01 | 1 | HIST-03 | production build | `pnpm build` | ✅ | ✅ green |
| 7-02-01 | 02 | 2 | HIST-03 | fixture validation | `pnpm typecheck` | ✅ | ✅ green |
| 7-02-02 | 02 | 2 | ROOM-03, OPER-03 | release package build | `pnpm build` | ✅ | ✅ green |
| 7-02-03 | 02 | 2 | HIST-03, ROOM-03, OPER-03 | full validation | `pnpm check` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Operator summary distinguishes new, sustained, slipping, and recovering pressure | OPER-03 | Requires visual judgment of summary-first copy hierarchy | Launch demo mode, open `/?view=agents&panel=virtual`, confirm `Build Bay` is slipping, `Review Booth` is sustained, `Research Bay` is recovering, and the operator summary/bottleneck rail use those labels before opening detail views. |
| Room and mission detail explain why pressure is worsening or recovering | ROOM-03 | Explanation quality and density are UI-specific | Focus `Build Bay` and `Research Bay`, then confirm the shared detail drawer shows lifecycle label + lifecycle reason together with wait/age metrics and history source. |
| Partial-history fallback remains readable in demo packaging | HIST-03 | Needs end-to-end fixture and `/api/snapshot` inspection | Inspect `/api/snapshot` in demo mode and verify `pressure.taskMetricsByTaskId` plus `pressure.roomMetricsByRoomId` include lifecycle state/reason fields that match the UI; if partial/current-only records are present, confirm the source hint remains readable. |
| Public screenshots remain demo-safe | ROOM-03, OPER-03 | Asset provenance cannot be proven by static checks alone | Capture `.github/assets/readme-demo.png`, `.github/assets/readme-mobile.png`, `.github/assets/preview-mission-control.png`, `.github/assets/preview-overview.png`, `.github/assets/preview-history.png`, `.github/assets/preview-usage.png`, `.github/assets/preview-scheduler.png`, and `.github/assets/social-preview.png` only while `OPENCLAW_HOME=demo/openclaw-home` is active. |

## Verification Log

### Automated

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `pnpm check`

### Manual

- Browser-verified `Agents` demo mode shows:
  - `TQ-108` / `Build Bay` as `slipping`
  - `TQ-097` / `Review Booth` as `sustained`
  - `TQ-101` / `Research Bay` as `recovering`
- Browser-verified detail drawer exposes lifecycle label, lifecycle reason, wait/age metrics, and history source.
- API-verified `/api/snapshot` returns lifecycle states under `pressure.taskMetricsByTaskId` and room lifecycle states under `pressure.roomMetricsByRoomId`.
- Refreshed public screenshots were captured from the bundled demo session only.

### Known Scope Limits

- The bundled demo currently proves `slipping`, `sustained`, and `recovering` directly; `new` remains covered by classifier logic and snapshot/API contract rather than a dedicated public screenshot.
- Partial-history and current-only lifecycle hints remain fallback-safe, but the bundled public demo path still defaults to the richer full-history sample.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete
