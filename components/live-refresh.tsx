"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveRefresh({
  enabled = true,
  intervalMs = 30_000
}: {
  enabled?: boolean;
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      startTransition(() => {
        router.refresh();
      });
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [enabled, intervalMs, router]);

  return null;
}
