import { NextResponse } from "next/server";

import {
  isMissionTaskActionAllowed,
  type MissionTaskAction
} from "@/lib/mission-control-actions";
import type { MissionControlTaskLane, MissionControlTaskStatus } from "@/lib/mission-control";
import { updateMissionControlTask } from "@/lib/mission-control-mutations";

const normalizeText = (value: unknown) => String(value || "").trim();

const asTaskAction = (value: string): MissionTaskAction | null => {
  switch (value) {
    case "start":
    case "send-to-review":
    case "advance":
    case "ready":
    case "block":
      return value;
    default:
      return null;
  }
};

const asTaskStatus = (value: string): MissionControlTaskStatus => {
  switch (value) {
    case "ready":
    case "running":
    case "review":
    case "done":
    case "blocked":
      return value;
    default:
      return "ready";
  }
};

const asLane = (value: string): MissionControlTaskLane => {
  switch (value) {
    case "research":
    case "build":
    case "qa":
    case "release":
      return value;
    default:
      return "research";
  }
};

const asRecord = (value: unknown) => (value && typeof value === "object" ? (value as Record<string, unknown>) : null);

type TaskRouteContext = {
  params: Promise<{ taskId: string }>;
};

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: TaskRouteContext) {
  const { taskId } = await context.params;
  const taskKey = normalizeText(taskId);
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = asTaskAction(normalizeText(body.action));

  if (!taskKey || !action) {
    return NextResponse.json({ error: "Task id and valid action are required." }, { status: 400 });
  }

  const launchpadApiBaseUrl = normalizeText(process.env.AGENT_LAUNCHPAD_API_BASE_URL);

  try {
    if (launchpadApiBaseUrl) {
      const taskResponse = await fetch(`${launchpadApiBaseUrl}/api/tasks/${encodeURIComponent(taskKey)}`, {
        cache: "no-store"
      });
      const taskResult = (await taskResponse.json().catch(() => ({}))) as Record<string, unknown>;
      if (!taskResponse.ok) {
        return NextResponse.json(taskResult, { status: taskResponse.status });
      }

      const task = asRecord(taskResult.task);
      const featureId = normalizeText(task?.featureId);
      const taskStatus = asTaskStatus(normalizeText(task?.status));
      const taskLane = asLane(normalizeText(task?.lane));

      if (!featureId) {
        return NextResponse.json({ error: "Launchpad task lookup did not return a feature id." }, { status: 502 });
      }

      const featureResponse = await fetch(`${launchpadApiBaseUrl}/api/features/${encodeURIComponent(featureId)}`, {
        cache: "no-store"
      });
      const featureResult = (await featureResponse.json().catch(() => ({}))) as Record<string, unknown>;
      if (!featureResponse.ok) {
        return NextResponse.json(featureResult, { status: featureResponse.status });
      }

      const feature = asRecord(featureResult.feature);
      const currentLane = asLane(normalizeText(feature?.currentLane));
      const deliveryMode = normalizeText(feature?.deliveryMode);
      if (currentLane !== taskLane) {
        return NextResponse.json(
          { error: `Task ${taskKey} is in ${taskLane}, but the feature is currently in ${currentLane}.` },
          { status: 409 }
        );
      }

      if (
        !isMissionTaskActionAllowed({
          status: taskStatus,
          lane: taskLane,
          mode: "remote",
          action
        })
      ) {
        return NextResponse.json(
          { error: `Action ${action} is not available for a ${taskStatus} task in remote mode.` },
          { status: 409 }
        );
      }

      if (action === "start" || action === "send-to-review") {
        return NextResponse.json(
          { error: `Action ${action} requires local state mutation support and is unavailable in remote mode.` },
          { status: 409 }
        );
      }

      const workflowPayload =
        action === "ready"
          ? { action: "handoff", target: taskLane }
          : action === "block"
            ? { action: "gate", verdict: "fail" }
            : { action: "gate", verdict: "pass" };

      const workflowResponse = await fetch(`${launchpadApiBaseUrl}/api/features/${encodeURIComponent(featureId)}/workflow`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(workflowPayload),
        cache: "no-store"
      });
      const workflowResult = (await workflowResponse.json().catch(() => ({}))) as Record<string, unknown>;
      if (!workflowResponse.ok) {
        return NextResponse.json(workflowResult, { status: workflowResponse.status });
      }

      if (action === "advance" && taskLane === "research" && deliveryMode !== "advisory-only") {
        const handoffResponse = await fetch(
          `${launchpadApiBaseUrl}/api/features/${encodeURIComponent(featureId)}/workflow`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify({ action: "handoff", target: "build" }),
            cache: "no-store"
          }
        );
        const handoffResult = (await handoffResponse.json().catch(() => ({}))) as Record<string, unknown>;
        if (!handoffResponse.ok) {
          return NextResponse.json(handoffResult, { status: handoffResponse.status });
        }

        return NextResponse.json(handoffResult, { status: 200 });
      }

      return NextResponse.json(workflowResult, { status: 200 });
    }

    const result = await updateMissionControlTask({ tqId: taskKey, action });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Mission task update failed."
      },
      { status: 500 }
    );
  }
}
