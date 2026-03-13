# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [Unreleased]

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
