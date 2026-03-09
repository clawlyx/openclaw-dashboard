# Security Policy

## Supported versions

Security fixes are applied to the latest state of the default branch.

Because this project is still pre-`1.0`, older commits and ad-hoc local forks should be treated as unsupported unless a maintainer explicitly states otherwise.

## Reporting a vulnerability

Please do not open a public GitHub issue for a suspected vulnerability that could expose:

- secrets or tokens
- personal filesystem paths or local machine details
- private OpenClaw report data
- unintended read access outside the configured dashboard data sources

Prefer a private disclosure path:

1. Use GitHub private vulnerability reporting for this repository if it is enabled.
2. If private reporting is not enabled, contact a maintainer through a private channel before any public disclosure.

Include enough detail to reproduce and assess the issue:

- affected commit or branch
- setup details (`OPENCLAW_HOME`, demo mode vs live mode, OS / Node version)
- impact summary
- reproduction steps or proof of concept
- whether the issue is limited to local disclosure, public screenshot leakage, or remote exposure

## Response expectations

- Initial acknowledgement target: within 5 business days
- Status update target: after triage and reproduction
- Fix timing: depends on severity, exploitability, and whether a safe workaround exists

## Scope notes

This is a local-first dashboard. The highest-priority security issues are:

- leaking local machine paths or report contents through the UI, API, screenshots, or committed artifacts
- committing secrets or environment-specific files into the repository
- reading data outside the intended OpenClaw home or bundled demo dataset without clear operator intent
