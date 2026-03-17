---
phase: 10
slug: agent-work-provenance-and-concise-coordination-view
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-16
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Next.js + TypeScript + ESLint |
| **Config file** | `tsconfig.json`, `eslint.config.mjs` |
| **Quick run command** | `pnpm typecheck` |
| **Full suite command** | `pnpm check` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm typecheck`
- **After every plan wave:** Run `pnpm check`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | PROV-01 | typecheck | `pnpm typecheck` | ✅ | ⬜ pending |
| 10-01-02 | 01 | 1 | PROV-02 | typecheck | `pnpm typecheck` | ✅ | ⬜ pending |
| 10-01-03 | 01 | 1 | SUG-01 | build | `pnpm check` | ✅ | ⬜ pending |
| 10-02-01 | 02 | 2 | PROV-03 | lint | `pnpm lint` | ✅ | ⬜ pending |
| 10-02-02 | 02 | 2 | SUG-03 | build | `pnpm check` | ✅ | ⬜ pending |
| 10-02-03 | 02 | 2 | SIMP-01 | build | `pnpm check` | ✅ | ⬜ pending |
| 10-03-01 | 03 | 3 | SUG-02 | lint | `pnpm lint` | ✅ | ⬜ pending |
| 10-03-02 | 03 | 3 | SIMP-02 | build | `pnpm check` | ✅ | ⬜ pending |
| 10-03-03 | 03 | 3 | SIMP-03 | build | `pnpm check` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Working cards show exact repo or intake-thread provenance, including multi-session context when present | PROV-01, PROV-02, PROV-03 | UI trust depends on rendered copy, chip hierarchy, and fallback wording | Load the Agents virtual panel with demo data and a local snapshot; confirm working agents show repo/thread labels sourced from session metadata, not generic room names |
| Idle suggestions explain source and ranking without reading like auto-assignment | SUG-01, SUG-02, SUG-03 | Ranking explanation and advisory tone are presentation behaviors | Verify idle cards and queue entries show repo/research source labels plus rationale such as same repo, role fit, or research follow-up |
| Lower-half redesign feels concise and action-oriented | SIMP-01, SIMP-02, SIMP-03 | Overwhelm reduction is experiential and layout-dependent | Compare the default Agents view before and after the phase; confirm the lower half prioritizes active work, handoffs, and attention items while secondary analytics are reduced or deferred |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
