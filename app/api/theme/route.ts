import { NextResponse } from "next/server";

import { resolveTheme, sanitizeNextPath, THEME_COOKIE } from "@/lib/theme";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = resolveTheme(url.searchParams.get("mode"));
  const nextPath = sanitizeNextPath(url.searchParams.get("next"));
  const response = new NextResponse(null, {
    status: 303,
    headers: {
      Location: nextPath
    }
  });

  response.cookies.set(THEME_COOKIE, mode, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax"
  });

  return response;
}
