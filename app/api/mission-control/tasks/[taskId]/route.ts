import { NextResponse } from "next/server";

import { updateMissionControlTask, type MissionTaskAction } from "@/lib/mission-control-mutations";

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
      const response = await fetch(`${launchpadApiBaseUrl}/api/tasks/${encodeURIComponent(taskKey)}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ action }),
        cache: "no-store"
      });

      const result = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      if (!response.ok) {
        return NextResponse.json(result, { status: response.status });
      }

      return NextResponse.json(result, { status: 200 });
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
