# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.5.0 — Coordination Clarity

**Shipped:** 2026-03-21
**Phases:** 3 | **Plans:** 9 | **Sessions:** 4

### What Was Built
- Explicit exact, partial, and unavailable Mission Control mapping across Agents with safe handoff into Mission Control.
- One shared overlap and handoff model reused by both `Agents` and `Mission Control`.
- One ranked recommendation with intervene, watch, and calm states plus updated demo, README, and runbook coverage.

### What Worked
- Reusing existing surfaces kept the milestone focused on operator clarity instead of layout churn.
- Bundled demo variants made snapshot, browser, and documentation verification repeatable.

### What Was Inefficient
- Missing standalone `VALIDATION.md` artifacts left Nyquist discovery incomplete at milestone closeout.
- Phase 13 landed in exec mode without incremental feature commits, so milestone completion had to clean up history at the archive boundary.

### Patterns Established
- Coordination signals should be derived once on the server and reused across UI surfaces.
- Recommended next moves must stay advisory and explicit about destination surface and confidence.

### Key Lessons
1. Coordination clarity improves faster when it strengthens the current scan path instead of inventing a new workspace.
2. Demo scenario switches are worth preserving because they keep cross-surface verification cheap and repeatable.

### Cost Observations
- Model mix: balanced profile with one milestone-audit subagent; exact provider split was not recorded
- Sessions: 4
- Notable: research was intentionally skipped, which kept the milestone focused on shipping clarity across known surfaces

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.5.0 | 4 | 3 | Strengthened existing `Agents` and `Mission Control` flows instead of adding a new coordination surface |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.5.0 | `pnpm check` + bundled demo browser verification + `/api/snapshot` probes | milestone requirements audited 9/9 satisfied | 0 |

### Top Lessons (Verified Across Milestones)

1. The highest-leverage coordination improvements usually come from making current operator surfaces more trustworthy, not wider.
2. Bundled demo data is critical for repeatable public-safe validation across docs, runbooks, and UI changes.
