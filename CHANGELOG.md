# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [Unreleased]

## [1.2.0] - 2026-03-14

### Added

- Explicit mission ownership/task references across the workstation snapshot so agents and tasks can point at each other directly.
- A shared room or agent detail drawer in the `Agents` workspace with current mission, handoff history, and artifact evidence.
- Inline office actions that reuse Mission Control transitions from the office drawer.
- A mission-aware pressure rail covering stale review, blocked-too-long, waiting-on-human, inferred ownership, and overloaded rooms.

### Changed

- Promoted the `Agents` workspace from a joined office view into the workstation's operator-priority surface.
- Refreshed the bundled demo data and public screenshots so the `1.2.0` preview shows explicit ownership and pressure cues safely.
- Bumped the app version to `1.2.0` for the explicit-ownership milestone.

### Fixed

- Anchored pressure age calculations to the stable snapshot timestamp so the office UI stays deterministic across hydration.
- Prioritized mission queue cards by active pressure so the hottest work surfaces ahead of quieter tasks.

## [1.1.0] - 2026-03-14

### Added

- Room-level mission ownership in the `Agents` virtual office so each office zone shows which live mission it currently covers.
- An inline mission queue rail in the `Agents` office view so operators can inspect active Launchpad tasks without leaving the office surface.
- Click-through mission queue cards that focus the owning room directly from the office view.

### Changed

- Promoted the `Agents` workspace from a status board into a tighter Mission Control companion surface.
- Bumped the app version to `1.1.0` for the first post-`1.0.0` workstation enhancement release.

### Fixed

- Kept focused offline desks visible in room detail mode so rooms like `Review Booth` still show the responsible desk when no recent session activity exists.
- Corrected room occupancy math so live seat counts no longer exceed configured room capacity.

## [1.0.0] - 2026-03-14

### Added

- A top-level `Mission Control` workspace with dedicated `Active missions`, `Execution queue`, `Review desk`, and `Release lane` views.
- A new Launchpad-backed `missionControl` branch in `/api/snapshot` so the workstation can render live feature, task, review, and release state beside `agents`.
- In-app mission intake from the dashboard, including repo/project/workspace binding and delivery-mode selection.
- Operator task controls for Mission Control so queue items can be started, sent to review, advanced, blocked, or reset to ready as supported by the active mode.
- A tracked `1.0.0` release-candidate runbook for the workstation milestone.

### Changed

- Promoted the product from a read-heavy dashboard to a workstation surface for agents, missions, usage, providers, and scheduler health.
- Bumped the package version to `1.0.0` and aligned the V2 Mission Control plan with that release target.
- Updated Mission Control remote-mode task actions to route through Launchpad workflow APIs instead of assuming direct task mutation support.

### Fixed

- Hardened Mission Control task mutation rules so unsupported transitions are rejected server-side instead of relying only on UI buttons.
- Derived local Launchpad fallback counters from existing state to avoid ID reuse and artifact collisions when older state files are missing next-number fields.
- Corrected the remote research-review advance flow so repo-bound features move into the next build lane instead of stalling at review-approved status.

## [0.4.0] - 2026-03-13

### Added

- A top-level `Agents` workspace with `Virtual Office`, `Office Floor`, `Queues & handoffs`, and `Recent activity` panels.
- A pixel-art `Virtual Office` scene that places OpenClaw agents into room-based office zones with room focus, desk feed, and latest activity rails.
- A new agent snapshot flow in the public demo dataset so README and GitHub preview assets can show the multi-agent dashboard safely.

### Changed

- Reworked the app shell into a top menu plus contextual left navigation so each module renders as a focused single-panel workspace instead of a long scrolling homepage.
- Updated the public positioning of the product from a usage-only dashboard to a broader operations surface for agents, providers, usage, and scheduler health.
- Refreshed README, release docs, and GitHub preview assets to match the current `Agents`-first product surface.

### Fixed

- Prevented lobster-agent sprites in `Virtual Office` from overlapping by giving each room unique seat placement and separate overview/focus density.

## [0.3.0] - 2026-03-10

### Added

- Connected provider profile data in `usage.providerProfiles`, including auth type, profile expiry, and OpenRouter free-quota usage when present in the AI Model Daily Usage Report.
- Demo auth-profile fixture and richer demo usage report data so the public preview matches the current Providers card.

### Changed

- Reworked the homepage Providers card into active/inactive provider rows instead of a single rolling-quota box.
- Moved the Codex 5h / 7d limit tiles into the active provider row and split each tile into two lines for faster scanning.
- Tightened the Providers card spacing, hierarchy, and screenshot assets to match the current public UI.

## [0.2.0] - 2026-03-09

### Added

- Provider-aware limits data in `usage.providerLimits`, including reusable limit windows for the active provider.
- A reusable provider limits panel component for hero and usage surfaces.

### Changed

- Reduced homepage copy density so the first screen is easier to scan and act on.
- Updated the dashboard UI and public docs to describe provider limits instead of a Codex-only rolling quota card.
- Refreshed package metadata for the provider-limits terminology used in this release.

## [0.1.0] - 2026-03-08

### Added

- Initial MVP release of OpenClaw Dashboard.
