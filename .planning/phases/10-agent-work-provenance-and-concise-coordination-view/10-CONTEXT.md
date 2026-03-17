# Phase 10 Context

## Why This Exists

After the legacy repo-task cleanup is done, the Agents view still needs a stronger live workload model and a simpler coordination surface.

The operator expectation is:

- a working agent should show which repo it is actively serving or which research task it is pursuing
- provenance should come from live OpenClaw/Codex/Discord session metadata rather than inferred room labels
- coding work should surface from `#repo-work` threads
- personal research should surface from `#intake` threads
- idle suggestions should consider real open GSD repo work plus actionable personal research tasks
- the lower-half Agents UI should become much more concise and obvious about why it exists

## Specific Gaps Observed

1. The current derived agent snapshot produces one row per agent folder under `~/.openclaw/agents/*` and does not expose repo-aware concurrent workload context.
2. The default view can show a working agent without telling the operator which repo or thread that work belongs to.
3. Idle suggestions are currently too narrow; they should look across tracked GSD work and personal research queues for credible next actions.
4. The sections below Working / Blocked / Idle feel dense and overwhelming instead of like a concise coordination aid.

## Planning Intent

Phase 10 should plan for:

- a session-aware workload model for active agents
- explicit repo/thread/task provenance in the Agents roster
- advisory suggestion sourcing from repo and personal-research backlogs
- a simplified coordination view that highlights only the most helpful operator context
