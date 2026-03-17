# Phase 9 Context

## Why This Exists

The repo has accumulated too many overlapping task-system assumptions around repo work. Before the Agents view grows richer again, the milestone needs to cleanly retire the old repo-task plumbing.

The intended architecture shift is:

- archive or remove repo-task usage of `task-center`
- archive or remove repo-task usage of `agent-launchpad`
- archive or remove repo-task usage of `agent-workflow`
- keep only the personal research task layer in surviving task-center data
- preserve legitimate personal research `TQ-XXX` tasks while removing repo-bound clutter

## Specific Gaps Observed

1. Repo-task ownership is still split across old systems and creates ambiguity about which data should survive.
2. Repo-related tasks still pollute the task dataset even though the desired remaining task-center use is personal research.
3. A future live workload-provenance phase will be harder to trust if the old repo-task systems are still half-alive underneath it.
4. The cleanup needs explicit rules for what is preserved, archived, migrated, or deleted.

## Planning Intent

Phase 9 should plan for:

- inventorying all repo-task dependencies on `task-center`, `agent-launchpad`, and `agent-workflow`
- defining the retirement/archive path for each system
- identifying which `TQ-XXX` tasks are true personal research and should remain
- removing or archiving repo-related tasks so the surviving task-center data is intentionally personal-only
