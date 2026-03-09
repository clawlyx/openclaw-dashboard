# RFC: F-0022-openclaw-dashboard-light-dark-mode

## Context

- Project: openclaw-dashboard
- Workspace: openclaw-dashboard
- Repo: openclaw-dashboard
- Goal: add robust light/dark mode with system default, manual override, persistence, and minimal first-paint theme flash.

## Options

### Option A

- Description: CSS-only dark mode with manual class toggle (no system/default logic).
- Pros: simple implementation.
- Cons: does not satisfy system-first behavior and can cause inconsistent first load.

### Option B

- Description: Three-mode preference (`system|light|dark`) with pre-hydration theme initialization script and client toggle UI.
- Pros: meets system default requirement, supports explicit override, reduces flash, easy to extend.
- Cons: slightly more frontend state logic.

## Recommended Approach

Option B.

## Design

### Discord Design

- N/A.

### OpenClaw Design

- Frontend-only visual/theme change. No OpenClaw API/data contract updates.

### Codex / Build Flow

- Added `components/theme-switch.tsx` with `system|light|dark` control.
- Added pre-hydration theme init in `app/layout.tsx` (`beforeInteractive`) reading localStorage and setting `document.documentElement.dataset.theme`.
- Added locale strings for theme labels in `locales/en.json` and `locales/zh.json`.
- Integrated theme switch into top toolbar in `app/page.tsx`.
- Added dark-token and surface overrides in `app/globals.css` using `html[data-theme="dark"]`.

### GitHub / CI Gate

- Required checks: `pnpm check` (lint + typecheck + build).
- Result: pass.

## Edge Cases

- No stored preference: defaults to `system` and follows OS preference.
- Invalid stored value: normalized to `system`.
- OS theme changes while in `system` mode: updates live via `matchMedia` listener.

## Risks

- Some deeply nested legacy styles may still require iterative tuning for perfect dark contrast.

## Test Strategy

- Automated:
  - `pnpm check`
- Manual:
  1. First visit with dark OS theme -> dashboard opens dark.
  2. Switch to light from toolbar -> refresh persists light.
  3. Switch to Auto -> follows OS and responds to OS theme changes.
  4. Validate tables/charts/cards/status chips in both themes on desktop/mobile viewport.

## Acceptance Criteria

1. Visible theme toggle available in top toolbar. ✅
2. First visit follows system theme; manual override persists. ✅
3. Initial wrong-theme flash minimized with pre-hydration script. ✅
4. Core homepage modules remain readable in both themes. ✅

## Rollout Notes

- Migration: none.
- Rollback: revert theme switch component, layout script, and dark-theme CSS overrides.
