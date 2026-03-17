import { NextResponse } from "next/server";

import { createMissionControlIntake } from "@/lib/mission-control-mutations";

const normalizeText = (value: unknown) => String(value || "").trim();

const asDeliveryMode = (value: string) => {
  switch (value) {
    case "advisory-only":
    case "local-only":
    case "commit-required":
    case "push-required":
    case "pr-required":
      return value;
    default:
      return "pr-required";
  }
};

const asLane = (value: string) => {
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

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const title = normalizeText(body.title);
  const details = normalizeText(body.details);

  if (!title || !details) {
    return NextResponse.json({ error: "Title and details are required." }, { status: 400 });
  }

  const legacyRemoteApi =
    normalizeText(process.env.MISSION_CONTROL_API_BASE_URL) ||
    normalizeText(process.env.AGENT_LAUNCHPAD_API_BASE_URL);
  const payload = {
    title,
    details,
    project: normalizeText(body.project),
    workspace: normalizeText(body.workspace),
    repo: normalizeText(body.repo),
    deliveryMode: asDeliveryMode(normalizeText(body.deliveryMode)),
    startLane: asLane(normalizeText(body.startLane))
  };

  try {
    if (legacyRemoteApi) {
      return NextResponse.json(
        {
          error:
            "Remote mission-control intake is archived in Phase 9. Use the local mission archive state instead of the retired Launchpad workflow bridge."
        },
        { status: 410 }
      );
    }

    const result = await createMissionControlIntake(payload);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Mission intake failed."
      },
      { status: 500 }
    );
  }
}
