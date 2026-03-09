# Contributing

## Development

```bash
cp .env.example .env
pnpm install
pnpm dev
```

The app reads from `OPENCLAW_HOME` when it is set. If no live OpenClaw home is available, it falls back to `demo/openclaw-home`.

Keep `.env.example` on the standard `3000` port. If you need a different local port, override it in your untracked `.env`.

## Git workflow

This repo uses a lightweight trunk-based workflow with conventional commit naming.

Default approach:

- small, low-risk changes can be committed directly to `main`
- larger or higher-risk changes should use a review branch and pull request

Naming convention:

- branch: `codex/feat/<topic>`, `codex/fix/<topic>`, `codex/chore/<topic>`, `codex/docs/<topic>`
- commit: `feat(scope): ...`, `fix(scope): ...`, `chore(scope): ...`, `docs(scope): ...`
- PR title: match the conventional commit style

## Validation

Run the standard checks before opening a pull request:

```bash
pnpm lint
pnpm check
```

For UI or screenshot updates, verify the app with the bundled demo dataset:

```bash
OPENCLAW_HOME=demo/openclaw-home pnpm dev
```

When a change affects screenshots, README visuals, or public demos, regenerate them from the bundled demo dataset instead of live local data.

## Pull request expectations

- Summarize the problem and the high-level change.
- Call out any user-facing behavior changes, migrations, or data contract changes.
- Include validation details for typecheck, build, and manual smoke checks.
- List known risks, follow-up work, and rollback notes when the change is non-trivial.
- Route sensitive vulnerability reports through `SECURITY.md` instead of public issues.

## Contribution rules

- Keep the dashboard read-only unless a change explicitly expands the product scope.
- Do not commit secrets, local-only config, or screenshots generated from real personal data.
- Put user-facing copy in the locale dictionaries instead of hardcoding labels in components.
- Update `README.md` and `CHANGELOG.md` when behavior or setup changes.
