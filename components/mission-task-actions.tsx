"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { MissionControlTaskLane, MissionControlTaskSnapshot, MissionControlTaskStatus } from "@/lib/mission-control";
import type { MissionTaskAction } from "@/lib/mission-control-mutations";

type MissionTaskActionMessages = {
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
  label: string;
  tone?: "primary" | "secondary" | "warning";
};

const buildActions = (
  status: MissionControlTaskStatus,
  lane: MissionControlTaskLane,
  copy: MissionTaskActionMessages
): TaskActionDefinition[] => {
  switch (status) {
    case "ready":
      return [
        { action: "start", label: copy.actionStart, tone: "primary" },
        { action: "block", label: copy.actionBlock, tone: "warning" }
      ];
    case "running":
      return [
        { action: "send-to-review", label: copy.actionSendToReview, tone: "primary" },
        { action: "block", label: copy.actionBlock, tone: "warning" }
      ];
    case "review":
      return [
        { action: "advance", label: lane === "release" ? copy.actionRelease : copy.actionAdvance, tone: "primary" },
        { action: "block", label: copy.actionBlock, tone: "warning" }
      ];
    case "blocked":
      return [{ action: "ready", label: copy.actionReady, tone: "secondary" }];
    case "done":
      return [];
  }
};

export function MissionTaskActions({
  task,
  copy
}: {
  task: MissionControlTaskSnapshot;
  copy: MissionTaskActionMessages;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const actions = buildActions(task.status, task.lane, copy);

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
            className={`missionTaskActionButton missionTaskActionButton-${action.tone || "secondary"}`}
            type="button"
            disabled={isPending}
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
