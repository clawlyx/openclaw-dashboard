# Brief: F-0022-openclaw-dashboard-light-dark-mode

## Summary

- Title: OpenClaw Dashboard Light/Dark Mode
- Project: openclaw-dashboard
- Workspace: openclaw-dashboard
- Repo: openclaw-dashboard
- Requester: web
- Owner: build lane
- Date: 2026-03-09

## Problem

The dashboard currently lacks robust dual-theme support, reducing readability and comfort across different user and system theme preferences.

## User Value

- Target user:
  - OpenClaw dashboard users on desktop and mobile
- Value delivered:
  - Clear light/dark presentation with explicit user control
  - System-theme default behavior on first visit
  - Persistent manual preference across reloads

## Non-goals

- No IA redesign
- No additional theme packs beyond light/dark
- No backend preference sync

## Scope

- In scope:
  - Add `Auto / Light / Dark` switch in top toolbar
  - Follow system theme by default
  - Persist manual preference in browser storage
  - Add dark-theme token/surface styles for hero/cards/tables/charts
  - Minimize first-load wrong-theme flash
- Out of scope:
  - Full visual redesign
  - Advanced accessibility palette system

## Affected Surfaces

- Discord: none
- OpenClaw: frontend dashboard theming only
- Codex: build implementation + docs
- GitHub / CI: frontend checks via lint/typecheck/build

## Constraints

- Keep current localization behavior intact
- Ensure desktop/mobile theme switch works consistently
- No API contract changes

## Draft Acceptance Criteria

1. Visible top-toolbar theme switch works.
2. First visit follows system preference; manual choice persists.
3. Core dashboard modules remain legible in both themes.
4. First-paint wrong-theme flash is minimized.

## Risks

- Some legacy hardcoded visual accents may need follow-up contrast tuning.

## Handoff

- Next agent: qa/release
- Next artifact: `docs/qa/F-0022-openclaw-dashboard-light-dark-mode.md` and `docs/release/F-0022-openclaw-dashboard-light-dark-mode.md`
