import { NextResponse } from "next/server";

import { getDashboardSnapshot } from "@/lib/openclaw";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const demoRecommendation = searchParams.get("demoRecommendation");
  const snapshot = await getDashboardSnapshot({
    demoRecommendation:
      demoRecommendation === "intervene" || demoRecommendation === "watch" || demoRecommendation === "calm"
        ? demoRecommendation
        : undefined
  });
  return NextResponse.json(snapshot);
}
