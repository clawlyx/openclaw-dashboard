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

  const launchpadApiBaseUrl = normalizeText(process.env.AGENT_LAUNCHPAD_API_BASE_URL);
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
    if (launchpadApiBaseUrl) {
      const createResponse = await fetch(`${launchpadApiBaseUrl}/api/ideas`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(payload),
        cache: "no-store"
      });
      const createResult = (await createResponse.json().catch(() => ({}))) as Record<string, unknown>;
      if (!createResponse.ok) {
        return NextResponse.json(createResult, { status: createResponse.status });
      }

      const ideaRecord =
        createResult.idea && typeof createResult.idea === "object"
          ? (createResult.idea as Record<string, unknown>)
          : null;
      const ideaId = ideaRecord ? normalizeText(ideaRecord.ideaId) : "";

      if (!ideaId) {
        return NextResponse.json(
          { error: "Launchpad intake did not return an idea id." },
          { status: 502 }
        );
      }

      const promoteResponse = await fetch(`${launchpadApiBaseUrl}/api/ideas/${ideaId}/promote`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ target: payload.startLane }),
        cache: "no-store"
      });
      const promoteResult = (await promoteResponse.json().catch(() => ({}))) as Record<string, unknown>;
      if (!promoteResponse.ok) {
        return NextResponse.json(promoteResult, { status: promoteResponse.status });
      }

      return NextResponse.json(
        {
          idea: createResult.idea,
          feature: promoteResult.feature || createResult.feature,
          createdTask: promoteResult.createdTask || null
        },
        { status: 201 }
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
