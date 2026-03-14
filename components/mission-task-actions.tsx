"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { MissionControlTaskSnapshot } from "@/lib/mission-control";
import {
  getMissionTaskActionStates,
  type MissionTaskAction,
  type MissionTaskMutationMode
} from "@/lib/mission-control-actions";

export type MissionTaskActionMessages = {
  actionStart: string;
  actionSendToReview: string;
  actionAdvance: string;
  actionRelease: string;
  actionReady: string;
  actionBlock: string;
  actionUpdating: string;
  actionError: string;
};

type TaskActionDefinition = {
  action: MissionTaskAction;
  enabled: boolean;
  label: string;
  tone?: "primary" | "secondary" | "warning";
};

const buildActions = (
  status: MissionControlTaskSnapshot["status"],
  lane: MissionControlTaskSnapshot["lane"],
  copy: MissionTaskActionMessages,
  mode: MissionTaskMutationMode
): TaskActionDefinition[] => {
  return getMissionTaskActionStates({ status, lane, mode }).map(({ action, enabled }) => ({
    action,
    enabled,
    label:
      action === "start"
        ? copy.actionStart
        : action === "send-to-review"
          ? copy.actionSendToReview
          : action === "advance"
            ? lane === "release"
              ? copy.actionRelease
              : copy.actionAdvance
            : action === "ready"
              ? copy.actionReady
              : copy.actionBlock,
    tone: action === "block" ? "warning" : action === "ready" ? "secondary" : "primary"
  }));
};

export function MissionTaskActions({
  task,
  copy,
  mode,
  showDisabledActions = false
}: {
  task: MissionControlTaskSnapshot;
  copy: MissionTaskActionMessages;
  mode: MissionTaskMutationMode;
  showDisabledActions?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const actions = buildActions(task.status, task.lane, copy, mode).filter((action) => showDisabledActions || action.enabled);

  if (!actions.length) return null;

  const handleAction = (action: MissionTaskAction) => {
    if (isPending) return;

    setError("");
    startTransition(async () => {
      try {
        const response = await fetch(`/api/mission-control/tasks/${encodeURIComponent(task.tqId)}`, {
          method: "PATCH",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ action })
        });

        const result = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) {
          setError(result.error || copy.actionError);
          return;
        }

        router.refresh();
      } catch {
        setError(copy.actionError);
      }
    });
  };

  return (
    <div className="missionTaskActions">
      <div className="missionTaskActionRow">
        {actions.map((action) => (
          <button
            key={`${task.tqId}:${action.action}`}
            className={`missionTaskActionButton missionTaskActionButton-${action.tone || "secondary"} ${
              !action.enabled ? "missionTaskActionButton-disabled" : ""
            } ${isPending ? "missionTaskActionButton-pending" : ""}`}
            type="button"
            disabled={isPending || !action.enabled}
            onClick={() => handleAction(action.action)}
          >
            {isPending ? copy.actionUpdating : action.label}
          </button>
        ))}
      </div>
      {error ? <p className="missionFormStatus missionFormStatusError">{error}</p> : null}
    </div>
  );
}
