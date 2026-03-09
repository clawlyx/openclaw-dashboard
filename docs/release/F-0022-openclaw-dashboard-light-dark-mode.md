# Release Note: F-0022-openclaw-dashboard-light-dark-mode

## Change Summary

- Project: openclaw-dashboard
- Workspace: openclaw-dashboard
- Repo: openclaw-dashboard
- Delivered:
  - System-aware light/dark mode support
  - Toolbar theme switch (`Auto / Light / Dark`)
  - Persisted user preference (`oc-dashboard-theme`)
  - Pre-hydration theme init to reduce first-load flash
  - Dark theme token and component surface overrides

## Config / Migration Notes

- No API/schema migrations.
- Browser storage key introduced: `oc-dashboard-theme`.

## Rollback Plan

1. Remove theme switch from `app/page.tsx`.
2. Revert `app/layout.tsx` init script and dark-mode CSS overrides.
3. Keep dashboard in current light-only baseline.

## Smoke Test Checklist

1. First load (no saved preference) follows OS theme.
2. Toggle to Light or Dark and refresh; preference persists.
3. Toggle to Auto and verify theme tracks OS changes.
4. Run `pnpm check` before merge/release.

## Release Notes

- This is a UI-only enhancement and does not change data ingestion or API responses.
- Delivery mode is PR-required; release gate passes only after GitHub PR merge/approval.

## Approval

- QA status: PASS
- Human approver: pending
