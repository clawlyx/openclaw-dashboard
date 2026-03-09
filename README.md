# OpenClaw Dashboard

A local-first dashboard for OpenClaw. The current MVP focuses on two reliable surfaces:

- usage and quota visibility from the latest usage report
- cron scheduler health from `cron/jobs.json`

## Reference docs

- [Contribution guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Pull request template](.github/PULL_REQUEST_TEMPLATE.md)
- [Changelog](CHANGELOG.md)

This repo is intentionally broader than a single usage report skill. The goal is a proper OpenClaw dashboard that can grow into channels, browser telemetry, delivery health, and host-level schedulers.

![OpenClaw Dashboard demo](./.github/assets/readme-demo.png)

## Why this exists

OpenClaw can already produce reports. The weak point is repeatability:

- a chat agent can drift on formatting
- the same data gets re-explained differently across runs
- scheduled reporting is slower when a model has to think through every step

This dashboard uses direct local reads for the visual layer. If the source report is already correct, the UI stays correct.

## MVP

- latest usage report summary
- 5h / 7d quota status
- top-model source share
- model usage table
- cron overview
- next scheduled jobs
- failing or undelivered jobs list
- automatic fallback to a bundled demo dataset for public previews and first-run setup
- normalized usage history and trend charts across multiple reports

## How it runs

The app supports two data modes:

- live mode: reads from `OPENCLAW_HOME` or `~/.openclaw`
- demo mode: if neither path exists, it falls back to `demo/openclaw-home`
- local frontend binding: `pnpm dev` / `pnpm start` read `DASHBOARD_URL` from `.env` or `.env.local`

This makes the repo publishable as-is while still preferring real local data on machines that
already have OpenClaw installed.

## Data sources

By default the app reads from `~/.openclaw`. You can override that with `OPENCLAW_HOME`. If no
live install is present, the app serves bundled demo data instead.

- usage reports: `workspace/memory/usage/*.md`
- cron jobs: `cron/jobs.json`

This means the app is local-first and does not need a custom backend yet. The JSON snapshot is
also exposed at `/api/snapshot`, including normalized `usage.history` data for charts.

## Getting started

```bash
git clone <your-fork-or-this-repo-url>
cd openclaw-dashboard
cp .env.example .env
pnpm install
pnpm dev
```

Then open the URL from `DASHBOARD_URL` (the example config uses [http://localhost:3000](http://localhost:3000)).

Next.js will auto-load `.env` / `.env.local`, so after that first setup you can just run:

```bash
pnpm dev
```

If your OpenClaw home is not `~/.openclaw`, set it in `.env` or `.env.local`:

```bash
OPENCLAW_HOME=/path/to/.openclaw
```

`OPENCLAW_HOME=~/.openclaw` is also supported.

To move the local frontend off the default port, set this in `.env` or `.env.local`:

```bash
DASHBOARD_URL=http://localhost:3000
```

Then just run `pnpm dev` or `pnpm start`. The scripts will bind Next.js to that host and port. You can keep `.env.example` on `3000` and override your own local `.env` to `3200` or any other free port.

If you want to force the demo dataset for screenshots, previews, or CI, put this in `.env` / `.env.local` or use it inline:

```bash
OPENCLAW_HOME=demo/openclaw-home pnpm dev
```

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Or run the combined check:

```bash
pnpm check
```

The repo also includes a GitHub Actions workflow at `.github/workflows/ci.yml` that installs,
typechecks, and builds against the bundled demo dataset on every push to `main` and every pull
request.

## Git Workflow

This repo uses a lightweight trunk-based workflow with conventional commit naming.

Default approach:

- small, low-risk changes can be committed directly to `main`
- larger or higher-risk changes should use a review branch and pull request

Use direct commits to `main` for:

- copy and documentation edits
- small UI tweaks
- narrow bug fixes
- low-risk scripts and tooling changes

Use a branch and PR for:

- data-source contract changes
- parser refactors or dashboard architecture changes
- changes that span many files or alter user-facing behavior
- screenshot, localization, or release-prep work that benefits from review

Naming convention:

- branch: `codex/feat/<topic>`, `codex/fix/<topic>`, `codex/chore/<topic>`, `codex/docs/<topic>`
- commit: `feat(scope): ...`, `fix(scope): ...`, `chore(scope): ...`, `docs(scope): ...`
- PR title: match the conventional commit style

## Current assumptions

- usage data is parsed from the markdown produced by the current `usage-tracker`
- the parser accepts both newer account-status reports and older quota-only report variants
- top-model source share is derived from `Model × Source Breakdown`
- host-side schedulers like `launchd` are not ingested yet

## Roadmap

- ingest launchd / system cron so host-side jobs appear next to OpenClaw cron jobs
- add channel delivery status for Telegram / Discord / Feishu
- add browser automation telemetry
- normalize usage history into JSON for real charts instead of markdown parsing
- expose a packaged install path as a reusable OpenClaw integration/skill

## Open source hygiene

Do not commit:

- real bot tokens
- personal chat ids unless they are meant to be public examples
- your full `openclaw.json`
- private report data you do not want exposed
- real `~/.openclaw` snapshots unless you explicitly want them public

The demo dataset under `demo/openclaw-home` is synthetic and safe to publish.
The public screenshot in `.github/assets/readme-demo.png` should always be generated from the bundled demo dataset.

## License

MIT
